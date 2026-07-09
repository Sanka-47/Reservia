import { BookingStatus } from '../entities/booking.entity';
export declare class GetBookingsFilterDto {
    page?: number;
    limit?: number;
    status?: BookingStatus;
    serviceId?: string;
    search?: string;
}
