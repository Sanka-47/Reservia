import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ClaimBookingsDto } from './dto/claim-bookings.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { GetBookingsFilterDto } from './dto/get-bookings-filter.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto, req: any): Promise<import("./entities/booking.entity").Booking>;
    claim(claimBookingsDto: ClaimBookingsDto, req: any): Promise<{
        claimedCount: number;
    }>;
    findAll(filterDto: GetBookingsFilterDto, req: any): Promise<{
        data: import("./entities/booking.entity").Booking[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, req: any): Promise<import("./entities/booking.entity").Booking>;
    updateStatus(id: string, updateBookingStatusDto: UpdateBookingStatusDto, req: any): Promise<import("./entities/booking.entity").Booking>;
    cancel(id: string, req: any): Promise<import("./entities/booking.entity").Booking>;
    update(id: string, updateBookingDto: UpdateBookingDto, req: any): Promise<import("./entities/booking.entity").Booking>;
}
