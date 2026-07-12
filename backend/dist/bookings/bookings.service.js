"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("./entities/booking.entity");
const services_service_1 = require("../services/services.service");
const user_entity_1 = require("../users/entities/user.entity");
let BookingsService = class BookingsService {
    bookingsRepository;
    servicesService;
    constructor(bookingsRepository, servicesService) {
        this.bookingsRepository = bookingsRepository;
        this.servicesService = servicesService;
    }
    async create(createBookingDto, user) {
        const service = await this.servicesService.findOne(createBookingDto.serviceId);
        if (!service.isActive) {
            throw new common_1.BadRequestException(`Service "${service.title}" is currently inactive`);
        }
        const todayStr = new Date().toLocaleDateString('en-CA');
        if (createBookingDto.bookingDate < todayStr) {
            throw new common_1.BadRequestException('Booking date cannot be in the past');
        }
        if (createBookingDto.bookingDate === todayStr) {
            const now = new Date();
            const currentHour = now.getHours().toString().padStart(2, '0');
            const currentMin = now.getMinutes().toString().padStart(2, '0');
            const currentTimeStr = `${currentHour}:${currentMin}`;
            if (createBookingDto.bookingTime < currentTimeStr) {
                throw new common_1.BadRequestException('Booking time slot cannot be in the past');
            }
        }
        const duplicate = await this.bookingsRepository.findOne({
            where: {
                serviceId: createBookingDto.serviceId,
                bookingDate: createBookingDto.bookingDate,
                bookingTime: createBookingDto.bookingTime,
                status: (0, typeorm_2.Not)(booking_entity_1.BookingStatus.CANCELLED),
            },
        });
        if (duplicate) {
            throw new common_1.ConflictException(`This timeslot (${createBookingDto.bookingTime}) is already booked for this service on ${createBookingDto.bookingDate}`);
        }
        const customerName = createBookingDto.customerName || user?.name;
        const customerEmail = createBookingDto.customerEmail || user?.email;
        const customerPhone = createBookingDto.customerPhone || user?.phoneNumber;
        if (!customerName || !customerEmail || !customerPhone) {
            throw new common_1.BadRequestException('Customer contact details (name, email, phone) are required for non-authenticated bookings.');
        }
        const booking = this.bookingsRepository.create({
            ...createBookingDto,
            customerName,
            customerEmail,
            customerPhone,
            userId: user ? user.id : null,
            status: booking_entity_1.BookingStatus.PENDING,
        });
        const savedBooking = await this.bookingsRepository.save(booking);
        savedBooking.service = service;
        return savedBooking;
    }
    async findAll(filterDto, user) {
        const { page = 1, limit = 10, status, serviceId, search } = filterDto;
        const skip = (page - 1) * limit;
        const query = this.bookingsRepository
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.service', 'service');
        if (user.role === user_entity_1.UserRole.CUSTOMER) {
            query.andWhere('booking.userId = :userId', { userId: user.id });
        }
        if (status) {
            query.andWhere('booking.status = :status', { status });
        }
        if (serviceId) {
            query.andWhere('booking.serviceId = :serviceId', { serviceId });
        }
        if (search) {
            query.andWhere('(booking.customerName ILIKE :search OR booking.customerEmail ILIKE :search OR booking.customerPhone ILIKE :search OR service.title ILIKE :search)', { search: `%${search}%` });
        }
        query
            .orderBy('booking.bookingDate', 'DESC')
            .addOrderBy('booking.bookingTime', 'ASC')
            .skip(skip)
            .take(limit);
        const [data, total] = await query.getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id, user) {
        const booking = await this.bookingsRepository.findOne({
            where: { id },
            relations: { service: true },
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID "${id}" not found`);
        }
        if (user.role !== user_entity_1.UserRole.ADMIN && booking.userId !== user.id) {
            throw new common_1.ForbiddenException('You do not have permission to view this booking');
        }
        return booking;
    }
    async updateStatus(id, updateBookingStatusDto, user) {
        const { status } = updateBookingStatusDto;
        const booking = await this.findOne(id, user);
        if (booking.status === booking_entity_1.BookingStatus.CANCELLED &&
            status === booking_entity_1.BookingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cancelled bookings cannot be marked as completed');
        }
        booking.status = status;
        return this.bookingsRepository.save(booking);
    }
    async cancel(id, user) {
        const booking = await this.findOne(id, user);
        if (booking.status === booking_entity_1.BookingStatus.CANCELLED) {
            return booking;
        }
        booking.status = booking_entity_1.BookingStatus.CANCELLED;
        return this.bookingsRepository.save(booking);
    }
    async update(id, updateBookingDto, user) {
        const booking = await this.findOne(id, user);
        if (booking.status === booking_entity_1.BookingStatus.CANCELLED ||
            booking.status === booking_entity_1.BookingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot edit cancelled or completed bookings');
        }
        if (updateBookingDto.bookingDate || updateBookingDto.bookingTime) {
            const date = updateBookingDto.bookingDate || booking.bookingDate;
            const time = updateBookingDto.bookingTime || booking.bookingTime;
            const todayStr = new Date().toLocaleDateString('en-CA');
            if (date < todayStr) {
                throw new common_1.BadRequestException('Rescheduled date cannot be in the past');
            }
            if (date === todayStr) {
                const now = new Date();
                const currentHour = now.getHours().toString().padStart(2, '0');
                const currentMin = now.getMinutes().toString().padStart(2, '0');
                const currentTimeStr = `${currentHour}:${currentMin}`;
                if (time < currentTimeStr) {
                    throw new common_1.BadRequestException('Rescheduled time slot cannot be in the past');
                }
            }
            const duplicate = await this.bookingsRepository.findOne({
                where: {
                    id: (0, typeorm_2.Not)(id),
                    serviceId: booking.serviceId,
                    bookingDate: date,
                    bookingTime: time,
                    status: (0, typeorm_2.Not)(booking_entity_1.BookingStatus.CANCELLED),
                },
            });
            if (duplicate) {
                throw new common_1.ConflictException('The selected timeslot is already booked');
            }
            booking.bookingDate = date;
            booking.bookingTime = time;
            booking.status = booking_entity_1.BookingStatus.PENDING;
        }
        if (updateBookingDto.notes !== undefined) {
            booking.notes = updateBookingDto.notes;
        }
        if (updateBookingDto.customerName)
            booking.customerName = updateBookingDto.customerName;
        if (updateBookingDto.customerEmail)
            booking.customerEmail = updateBookingDto.customerEmail;
        if (updateBookingDto.customerPhone)
            booking.customerPhone = updateBookingDto.customerPhone;
        return this.bookingsRepository.save(booking);
    }
    async claim(bookingIds, user) {
        if (!bookingIds || bookingIds.length === 0) {
            return { claimedCount: 0 };
        }
        const bookings = await this.bookingsRepository.find({
            where: {
                id: (0, typeorm_2.In)(bookingIds),
                userId: (0, typeorm_2.IsNull)(),
            },
        });
        for (const booking of bookings) {
            booking.userId = user.id;
        }
        await this.bookingsRepository.save(bookings);
        return { claimedCount: bookings.length };
    }
    async getStats(filterDto) {
        const { status, serviceId, search } = filterDto;
        const query = this.bookingsRepository
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.service', 'service');
        if (status) {
            query.andWhere('booking.status = :status', { status });
        }
        if (serviceId) {
            query.andWhere('booking.serviceId = :serviceId', { serviceId });
        }
        if (search) {
            query.andWhere('(booking.customerName ILIKE :search OR booking.customerEmail ILIKE :search OR booking.customerPhone ILIKE :search OR service.title ILIKE :search)', { search: `%${search}%` });
        }
        const bookings = await query.getMany();
        const total = bookings.length;
        const pending = bookings.filter((b) => b.status === booking_entity_1.BookingStatus.PENDING).length;
        const confirmed = bookings.filter((b) => b.status === booking_entity_1.BookingStatus.CONFIRMED).length;
        const completed = bookings.filter((b) => b.status === booking_entity_1.BookingStatus.COMPLETED).length;
        const estimatedRevenue = bookings
            .filter((b) => b.status === booking_entity_1.BookingStatus.CONFIRMED ||
            b.status === booking_entity_1.BookingStatus.COMPLETED)
            .reduce((sum, b) => sum + Number(b.service?.price || 0), 0);
        return {
            total,
            pending,
            confirmed,
            completed,
            estimatedRevenue,
        };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        services_service_1.ServicesService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map