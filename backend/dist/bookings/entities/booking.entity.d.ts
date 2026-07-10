import { Service } from '../../services/entities/service.entity';
import { User } from '../../users/entities/user.entity';
export declare enum BookingStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}
export declare class Booking {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    serviceId: string;
    service: Service;
    userId: string;
    user: User;
    bookingDate: string;
    bookingTime: string;
    status: BookingStatus;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}
