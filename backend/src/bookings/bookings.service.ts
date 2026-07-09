import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { GetBookingsFilterDto } from './dto/get-bookings-filter.dto';
import { ServicesService } from '../services/services.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    private readonly servicesService: ServicesService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // 1. Verify service exists and is active
    const service = await this.servicesService.findOne(createBookingDto.serviceId);
    if (!service.isActive) {
      throw new BadRequestException(`Service "${service.title}" is currently inactive`);
    }

    // 2. Validate booking date is not in the past
    // Compare dates in standard YYYY-MM-DD local format
    const todayStr = new Date().toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD
    if (createBookingDto.bookingDate < todayStr) {
      throw new BadRequestException('Booking date cannot be in the past');
    }

    // 3. Prevent duplicate bookings for the same service, date, and time
    const duplicate = await this.bookingsRepository.findOne({
      where: {
        serviceId: createBookingDto.serviceId,
        bookingDate: createBookingDto.bookingDate,
        bookingTime: createBookingDto.bookingTime,
        status: Not(BookingStatus.CANCELLED),
      },
    });

    if (duplicate) {
      throw new ConflictException(
        `This timeslot (${createBookingDto.bookingTime}) is already booked for this service on ${createBookingDto.bookingDate}`,
      );
    }

    // 4. Create and save booking (default status is PENDING)
    const booking = this.bookingsRepository.create({
      ...createBookingDto,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingsRepository.save(booking);
    
    // Return with service attached
    savedBooking.service = service;
    return savedBooking;
  }

  async findAll(filterDto: GetBookingsFilterDto) {
    const { page = 1, limit = 10, status, serviceId, search } = filterDto;
    const skip = (page - 1) * limit;

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
      query.andWhere(
        '(booking.customerName ILIKE :search OR booking.customerEmail ILIKE :search OR booking.customerPhone ILIKE :search OR service.title ILIKE :search)',
        { search: `%${search}%` },
      );
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

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: { service: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    return booking;
  }

  async updateStatus(id: string, updateBookingStatusDto: UpdateBookingStatusDto): Promise<Booking> {
    const { status } = updateBookingStatusDto;
    const booking = await this.findOne(id);

    // Business rule: Cancelled bookings cannot be marked as completed
    if (booking.status === BookingStatus.CANCELLED && status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cancelled bookings cannot be marked as completed');
    }

    booking.status = status;
    return this.bookingsRepository.save(booking);
  }

  async cancel(id: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.status === BookingStatus.CANCELLED) {
      return booking;
    }

    booking.status = BookingStatus.CANCELLED;
    return this.bookingsRepository.save(booking);
  }
}
