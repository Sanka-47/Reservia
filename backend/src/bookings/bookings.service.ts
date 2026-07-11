import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, IsNull } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { GetBookingsFilterDto } from './dto/get-bookings-filter.dto';
import { ServicesService } from '../services/services.service';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    private readonly servicesService: ServicesService,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    user?: User,
  ): Promise<Booking> {
    // 1. Verify service exists and is active
    const service = await this.servicesService.findOne(
      createBookingDto.serviceId,
    );
    if (!service.isActive) {
      throw new BadRequestException(
        `Service "${service.title}" is currently inactive`,
      );
    }

    // 2. Validate booking date & time is not in the past
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local format
    if (createBookingDto.bookingDate < todayStr) {
      throw new BadRequestException('Booking date cannot be in the past');
    }
    if (createBookingDto.bookingDate === todayStr) {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMin = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHour}:${currentMin}`;
      if (createBookingDto.bookingTime < currentTimeStr) {
        throw new BadRequestException(
          'Booking time slot cannot be in the past',
        );
      }
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

    // 4. Populate customer info from session user if missing
    const customerName = createBookingDto.customerName || user?.name;
    const customerEmail = createBookingDto.customerEmail || user?.email;
    const customerPhone = createBookingDto.customerPhone || user?.phoneNumber;

    if (!customerName || !customerEmail || !customerPhone) {
      throw new BadRequestException(
        'Customer contact details (name, email, phone) are required for non-authenticated bookings.',
      );
    }

    // 5. Create and save booking
    const booking = this.bookingsRepository.create({
      ...createBookingDto,
      customerName,
      customerEmail,
      customerPhone,
      userId: user ? user.id : null,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingsRepository.save(booking);
    savedBooking.service = service;
    return savedBooking;
  }

  async findAll(filterDto: GetBookingsFilterDto, user: User) {
    const { page = 1, limit = 10, status, serviceId, search } = filterDto;
    const skip = (page - 1) * limit;

    const query = this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service');

    // ENFORCE Access control check: Customers can only see their own bookings
    if (user.role === UserRole.CUSTOMER) {
      query.andWhere('booking.userId = :userId', { userId: user.id });
    }

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

  async findOne(id: string, user: User): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: { service: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    // ENFORCE Access control check: Check ownership unless Admin
    if (user.role !== UserRole.ADMIN && booking.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to view this booking',
      );
    }

    return booking;
  }

  async updateStatus(
    id: string,
    updateBookingStatusDto: UpdateBookingStatusDto,
    user: User,
  ): Promise<Booking> {
    const { status } = updateBookingStatusDto;
    const booking = await this.findOne(id, user); // findOne already enforces ownership check

    // Business rule: Cancelled bookings cannot be marked as completed
    if (
      booking.status === BookingStatus.CANCELLED &&
      status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cancelled bookings cannot be marked as completed',
      );
    }

    booking.status = status;
    return this.bookingsRepository.save(booking);
  }

  async cancel(id: string, user: User): Promise<Booking> {
    const booking = await this.findOne(id, user); // findOne already enforces ownership check

    if (booking.status === BookingStatus.CANCELLED) {
      return booking;
    }

    booking.status = BookingStatus.CANCELLED;
    return this.bookingsRepository.save(booking);
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
    user: User,
  ): Promise<Booking> {
    const booking = await this.findOne(id, user); // findOne already checks ownership

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cannot edit cancelled or completed bookings',
      );
    }

    if (updateBookingDto.bookingDate || updateBookingDto.bookingTime) {
      const date = updateBookingDto.bookingDate || booking.bookingDate;
      const time = updateBookingDto.bookingTime || booking.bookingTime;

      // Validate date & time is not in the past
      const todayStr = new Date().toLocaleDateString('en-CA');
      if (date < todayStr) {
        throw new BadRequestException('Rescheduled date cannot be in the past');
      }
      if (date === todayStr) {
        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentMin = now.getMinutes().toString().padStart(2, '0');
        const currentTimeStr = `${currentHour}:${currentMin}`;
        if (time < currentTimeStr) {
          throw new BadRequestException(
            'Rescheduled time slot cannot be in the past',
          );
        }
      }

      // Check slot availability
      const duplicate = await this.bookingsRepository.findOne({
        where: {
          id: Not(id),
          serviceId: booking.serviceId,
          bookingDate: date,
          bookingTime: time,
          status: Not(BookingStatus.CANCELLED),
        },
      });

      if (duplicate) {
        throw new ConflictException('The selected timeslot is already booked');
      }

      booking.bookingDate = date;
      booking.bookingTime = time;
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

  async claim(
    bookingIds: string[],
    user: User,
  ): Promise<{ claimedCount: number }> {
    if (!bookingIds || bookingIds.length === 0) {
      return { claimedCount: 0 };
    }

    const bookings = await this.bookingsRepository.find({
      where: {
        id: In(bookingIds),
        userId: IsNull(),
      },
    });

    for (const booking of bookings) {
      booking.userId = user.id;
    }

    await this.bookingsRepository.save(bookings);
    return { claimedCount: bookings.length };
  }

  async getStats(filterDto: GetBookingsFilterDto) {
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
      query.andWhere(
        '(booking.customerName ILIKE :search OR booking.customerEmail ILIKE :search OR booking.customerPhone ILIKE :search OR service.title ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const bookings = await query.getMany();

    const total = bookings.length;
    const pending = bookings.filter(
      (b) => b.status === BookingStatus.PENDING,
    ).length;
    const confirmed = bookings.filter(
      (b) => b.status === BookingStatus.CONFIRMED,
    ).length;
    const completed = bookings.filter(
      (b) => b.status === BookingStatus.COMPLETED,
    ).length;
    const estimatedRevenue = bookings
      .filter(
        (b) =>
          b.status === BookingStatus.CONFIRMED ||
          b.status === BookingStatus.COMPLETED,
      )
      .reduce((sum, b) => sum + Number(b.service?.price || 0), 0);

    return {
      total,
      pending,
      confirmed,
      completed,
      estimatedRevenue,
    };
  }
}
