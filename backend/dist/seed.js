"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dir = __dirname;
try {
    const envPath = path.resolve(dir, '../../.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        for (const line of envConfig.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                continue;
            const index = trimmed.indexOf('=');
            if (index > 0) {
                const key = trimmed.substring(0, index).trim();
                let val = trimmed.substring(index + 1).trim();
                if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.substring(1, val.length - 1);
                }
                else if (val.startsWith("'") && val.endsWith("'")) {
                    val = val.substring(1, val.length - 1);
                }
                process.env[key] = val;
            }
        }
    }
}
catch {
    console.log('Error reading .env, using environment variables directly.');
}
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};
async function main() {
    const client = new pg_1.Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'reservia',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
    try {
        await client.connect();
        console.log('Connected to PostgreSQL successfully.');
        console.log('Cleaning up existing database records...');
        await client.query('DELETE FROM bookings');
        await client.query('DELETE FROM services');
        await client.query('DELETE FROM users');
        console.log('Inserting seed users...');
        const adminPassHash = hashPassword('admin123');
        const customerPassHash = hashPassword('password123');
        const userInsertQuery = `
      INSERT INTO users (id, username, "passwordHash", email, name, gender, "phoneNumber", dob, role)
      VALUES 
        (gen_random_uuid(), 'admin', $1, 'admin@reservia.com', 'System Administrator', 'Male', '+1000000000', '1985-01-01', 'ADMIN'),
        (gen_random_uuid(), 'john_doe', $2, 'john.doe@example.com', 'John Doe', 'Male', '+1555123456', '1990-05-15', 'CUSTOMER'),
        (gen_random_uuid(), 'jane_smith', $2, 'jane.smith@example.com', 'Jane Smith', 'Female', '+1555987654', '1992-10-20', 'CUSTOMER')
      RETURNING id, username;
    `;
        const userRes = await client.query(userInsertQuery, [
            adminPassHash,
            customerPassHash,
        ]);
        const usersMap = {};
        for (const r of userRes.rows) {
            usersMap[r.username] = r.id;
        }
        console.log('Users inserted successfully:', Object.keys(usersMap));
        console.log('Inserting seed services...');
        const serviceInsertQuery = `
      INSERT INTO services (id, title, description, duration, price, "isActive")
      VALUES
        (gen_random_uuid(), 'Haircut & Styling', 'Premium haircut including wash, head massage, blow dry, and styling.', 45, 35.00, true),
        (gen_random_uuid(), 'Full Body Massage', 'Relaxing Swedish or deep tissue massage to melt away stress.', 60, 80.00, true),
        (gen_random_uuid(), 'Manicure & Pedicure', 'Spa nail care service with cleaning, filing, scrub, massage, and polish.', 60, 45.00, true),
        (gen_random_uuid(), 'Facial Treatment', 'Hydrating and deep cleansing facial for skin rejuvenation.', 45, 50.00, true),
        (gen_random_uuid(), 'Teeth Whitening', 'Professional cosmetic teeth whitening for a bright smile.', 30, 120.00, true),
        (gen_random_uuid(), 'Personal Training Session', 'One-on-one personal training tailored to your fitness goals.', 60, 60.00, true),
        (gen_random_uuid(), 'Yoga Private Lesson', 'Private yoga instruction focusing on alignment and breathing.', 60, 50.00, true),
        (gen_random_uuid(), 'Therapeutic Counseling', 'Professional and confidential consultation with our therapist.', 50, 90.00, true),
        (gen_random_uuid(), 'Car Detailing - Interior', 'Thorough steam cleaning, vacuuming, and leather treatment for your car.', 120, 150.00, true),
        (gen_random_uuid(), 'AC Service & Gas Charge', 'Comprehensive AC maintenance, check, and refrigerant top-up.', 90, 75.00, false)
      RETURNING id, title;
    `;
        const serviceRes = await client.query(serviceInsertQuery);
        const servicesMap = {};
        for (const r of serviceRes.rows) {
            servicesMap[r.title] = r.id;
        }
        console.log('Services inserted successfully:', Object.keys(servicesMap));
        const getRelativeDate = (offsetDays) => {
            const d = new Date();
            d.setDate(d.getDate() + offsetDays);
            return d.toLocaleDateString('en-CA');
        };
        console.log('Inserting seed bookings...');
        const bookingsData = [
            {
                customerName: 'John Doe',
                customerEmail: 'john.doe@example.com',
                customerPhone: '+1555123456',
                serviceId: servicesMap['Haircut & Styling'],
                userId: usersMap['john_doe'],
                bookingDate: getRelativeDate(-5),
                bookingTime: '10:00',
                status: 'COMPLETED',
                notes: 'Needs hair washed with cool water.',
            },
            {
                customerName: 'John Doe',
                customerEmail: 'john.doe@example.com',
                customerPhone: '+1555123456',
                serviceId: servicesMap['Full Body Massage'],
                userId: usersMap['john_doe'],
                bookingDate: getRelativeDate(-2),
                bookingTime: '14:30',
                status: 'COMPLETED',
                notes: 'Prefers deep tissue pressure.',
            },
            {
                customerName: 'John Doe',
                customerEmail: 'john.doe@example.com',
                customerPhone: '+1555123456',
                serviceId: servicesMap['Manicure & Pedicure'],
                userId: usersMap['john_doe'],
                bookingDate: getRelativeDate(1),
                bookingTime: '11:00',
                status: 'CONFIRMED',
                notes: 'Regular polish.',
            },
            {
                customerName: 'John Doe',
                customerEmail: 'john.doe@example.com',
                customerPhone: '+1555123456',
                serviceId: servicesMap['Facial Treatment'],
                userId: usersMap['john_doe'],
                bookingDate: getRelativeDate(2),
                bookingTime: '09:00',
                status: 'PENDING',
                notes: 'First time getting a facial.',
            },
            {
                customerName: 'John Doe',
                customerEmail: 'john.doe@example.com',
                customerPhone: '+1555123456',
                serviceId: servicesMap['Teeth Whitening'],
                userId: usersMap['john_doe'],
                bookingDate: getRelativeDate(3),
                bookingTime: '16:00',
                status: 'PENDING',
                notes: null,
            },
            {
                customerName: 'John Doe',
                customerEmail: 'john.doe@example.com',
                customerPhone: '+1555123456',
                serviceId: servicesMap['Personal Training Session'],
                userId: usersMap['john_doe'],
                bookingDate: getRelativeDate(4),
                bookingTime: '09:30',
                status: 'CONFIRMED',
                notes: 'Focus on legs workout.',
            },
            {
                customerName: 'John Doe',
                customerEmail: 'john.doe@example.com',
                customerPhone: '+1555123456',
                serviceId: servicesMap['Yoga Private Lesson'],
                userId: usersMap['john_doe'],
                bookingDate: getRelativeDate(5),
                bookingTime: '15:00',
                status: 'PENDING',
                notes: 'Bringing my own mat.',
            },
            {
                customerName: 'John Doe',
                customerEmail: 'john.doe@example.com',
                customerPhone: '+1555123456',
                serviceId: servicesMap['Therapeutic Counseling'],
                userId: usersMap['john_doe'],
                bookingDate: getRelativeDate(6),
                bookingTime: '13:00',
                status: 'PENDING',
                notes: 'Introductory assessment.',
            },
            {
                customerName: 'John Doe',
                customerEmail: 'john.doe@example.com',
                customerPhone: '+1555123456',
                serviceId: servicesMap['Car Detailing - Interior'],
                userId: usersMap['john_doe'],
                bookingDate: getRelativeDate(7),
                bookingTime: '10:30',
                status: 'PENDING',
                notes: 'SUV model, lots of pet hair.',
            },
            {
                customerName: 'John Doe',
                customerEmail: 'john.doe@example.com',
                customerPhone: '+1555123456',
                serviceId: servicesMap['Haircut & Styling'],
                userId: usersMap['john_doe'],
                bookingDate: getRelativeDate(-10),
                bookingTime: '11:30',
                status: 'CANCELLED',
                notes: 'Had a work emergency.',
            },
            {
                customerName: 'John Doe',
                customerEmail: 'john.doe@example.com',
                customerPhone: '+1555123456',
                serviceId: servicesMap['Full Body Massage'],
                userId: usersMap['john_doe'],
                bookingDate: getRelativeDate(-8),
                bookingTime: '15:00',
                status: 'CANCELLED',
                notes: 'Rescheduled for later.',
            },
            {
                customerName: 'Jane Smith',
                customerEmail: 'jane.smith@example.com',
                customerPhone: '+1555987654',
                serviceId: servicesMap['Facial Treatment'],
                userId: usersMap['jane_smith'],
                bookingDate: getRelativeDate(-4),
                bookingTime: '11:00',
                status: 'COMPLETED',
                notes: 'Sensitive skin products.',
            },
            {
                customerName: 'Jane Smith',
                customerEmail: 'jane.smith@example.com',
                customerPhone: '+1555987654',
                serviceId: servicesMap['Teeth Whitening'],
                userId: usersMap['jane_smith'],
                bookingDate: getRelativeDate(-1),
                bookingTime: '13:30',
                status: 'COMPLETED',
                notes: null,
            },
            {
                customerName: 'Jane Smith',
                customerEmail: 'jane.smith@example.com',
                customerPhone: '+1555987654',
                serviceId: servicesMap['Manicure & Pedicure'],
                userId: usersMap['jane_smith'],
                bookingDate: getRelativeDate(1),
                bookingTime: '14:00',
                status: 'CONFIRMED',
                notes: 'Gel polish remove & apply.',
            },
            {
                customerName: 'Jane Smith',
                customerEmail: 'jane.smith@example.com',
                customerPhone: '+1555987654',
                serviceId: servicesMap['Yoga Private Lesson'],
                userId: usersMap['jane_smith'],
                bookingDate: getRelativeDate(2),
                bookingTime: '10:00',
                status: 'PENDING',
                notes: 'Needs help with stretching poses.',
            },
            {
                customerName: 'Jane Smith',
                customerEmail: 'jane.smith@example.com',
                customerPhone: '+1555987654',
                serviceId: servicesMap['Therapeutic Counseling'],
                userId: usersMap['jane_smith'],
                bookingDate: getRelativeDate(3),
                bookingTime: '15:30',
                status: 'PENDING',
                notes: 'Follow-up consultation.',
            },
            {
                customerName: 'Jane Smith',
                customerEmail: 'jane.smith@example.com',
                customerPhone: '+1555987654',
                serviceId: servicesMap['Haircut & Styling'],
                userId: usersMap['jane_smith'],
                bookingDate: getRelativeDate(5),
                bookingTime: '11:00',
                status: 'PENDING',
                notes: 'Cut only, no blow dry.',
            },
            {
                customerName: 'Jane Smith',
                customerEmail: 'jane.smith@example.com',
                customerPhone: '+1555987654',
                serviceId: servicesMap['Car Detailing - Interior'],
                userId: usersMap['jane_smith'],
                bookingDate: getRelativeDate(-12),
                bookingTime: '09:00',
                status: 'CANCELLED',
                notes: 'Car was in the shop.',
            },
        ];
        const bookingInsertQuery = `
      INSERT INTO bookings (id, "customerName", "customerEmail", "customerPhone", "serviceId", "userId", "bookingDate", "bookingTime", status, notes)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9);
    `;
        for (const b of bookingsData) {
            await client.query(bookingInsertQuery, [
                b.customerName,
                b.customerEmail,
                b.customerPhone,
                b.serviceId,
                b.userId,
                b.bookingDate,
                b.bookingTime,
                b.status,
                b.notes,
            ]);
        }
        console.log(`Inserted ${bookingsData.length} bookings successfully.`);
        console.log('Database seeding completed successfully!');
    }
    catch (err) {
        console.error('Seeding error:', err);
    }
    finally {
        await client.end();
        console.log('Database connection closed.');
    }
}
main();
//# sourceMappingURL=seed.js.map