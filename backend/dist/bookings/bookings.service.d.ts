import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { GetBookingsFilterDto } from './dto/get-bookings-filter.dto';
import { ServicesService } from '../services/services.service';
import { User } from '../users/entities/user.entity';
export declare class BookingsService {
    private readonly bookingsRepository;
    private readonly servicesService;
    constructor(bookingsRepository: Repository<Booking>, servicesService: ServicesService);
    create(createBookingDto: CreateBookingDto, user?: User): Promise<Booking>;
    findAll(filterDto: GetBookingsFilterDto, user: User): Promise<{
        data: Booking[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, user: User): Promise<Booking>;
    updateStatus(id: string, updateBookingStatusDto: UpdateBookingStatusDto, user: User): Promise<Booking>;
    cancel(id: string, user: User): Promise<Booking>;
    update(id: string, updateBookingDto: UpdateBookingDto, user: User): Promise<Booking>;
    claim(bookingIds: string[], user: User): Promise<{
        claimedCount: number;
    }>;
    getStats(filterDto: GetBookingsFilterDto): Promise<{
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        estimatedRevenue: number;
    }>;
}
