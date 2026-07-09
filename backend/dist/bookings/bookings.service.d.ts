import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { GetBookingsFilterDto } from './dto/get-bookings-filter.dto';
import { ServicesService } from '../services/services.service';
export declare class BookingsService {
    private readonly bookingsRepository;
    private readonly servicesService;
    constructor(bookingsRepository: Repository<Booking>, servicesService: ServicesService);
    create(createBookingDto: CreateBookingDto): Promise<Booking>;
    findAll(filterDto: GetBookingsFilterDto): Promise<{
        data: Booking[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Booking>;
    updateStatus(id: string, updateBookingStatusDto: UpdateBookingStatusDto): Promise<Booking>;
    cancel(id: string): Promise<Booking>;
}
