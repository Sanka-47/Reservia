import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingsService } from './bookings.service';
import { Booking, BookingStatus } from './entities/booking.entity';
import { ServicesService } from '../services/services.service';
import { User, UserRole } from '../users/entities/user.entity';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingsRepository: Repository<Booking>;
  let servicesService: ServicesService;

  const mockBookingRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((booking) => Promise.resolve({ id: 'booking-id', ...booking })),
    findOne: jest.fn(),
  };

  const mockServicesService = {
    findOne: jest.fn(),
  };

  const mockUser: User = {
    id: 'user-uuid-123',
    username: 'alice',
    passwordHash: 'hashedpassword',
    email: 'alice@example.com',
    name: 'Alice Smith',
    gender: 'Female',
    phoneNumber: '+1234567890',
    dob: '1995-10-15',
    role: UserRole.CUSTOMER,
    refreshTokenHash: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    bookingsRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    servicesService = module.get<ServicesService>(ServicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if service does not exist', async () => {
      mockServicesService.findOne.mockRejectedValue(new NotFoundException('Service not found'));

      const dto = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        serviceId: 'invalid-id',
        bookingDate: '2026-08-10',
        bookingTime: '10:00',
      };

      await expect(service.create(dto, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if service is inactive', async () => {
      mockServicesService.findOne.mockResolvedValue({ id: 'service-id', title: 'Test Service', isActive: false });

      const dto = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        serviceId: 'service-id',
        bookingDate: '2026-08-10',
        bookingTime: '10:00',
      };

      await expect(service.create(dto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if booking date is in the past', async () => {
      mockServicesService.findOne.mockResolvedValue({ id: 'service-id', title: 'Test Service', isActive: true });

      const dto = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        serviceId: 'service-id',
        bookingDate: '2020-01-01', // Past date
        bookingTime: '10:00',
      };

      await expect(service.create(dto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if duplicate booking exists', async () => {
      mockServicesService.findOne.mockResolvedValue({ id: 'service-id', title: 'Test Service', isActive: true });
      mockBookingRepository.findOne.mockResolvedValue({ id: 'existing-booking-id' });

      const dto = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        serviceId: 'service-id',
        bookingDate: '2026-08-10',
        bookingTime: '10:00',
      };

      await expect(service.create(dto, mockUser)).rejects.toThrow(ConflictException);
    });

    it('should create booking if all business rules pass', async () => {
      mockServicesService.findOne.mockResolvedValue({ id: 'service-id', title: 'Test Service', isActive: true });
      mockBookingRepository.findOne.mockResolvedValue(null);

      const dto = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        serviceId: 'service-id',
        bookingDate: '2026-08-10',
        bookingTime: '10:00',
      };

      const result = await service.create(dto, mockUser);
      expect(result).toBeDefined();
      expect(result.customerName).toBe('John Doe');
      expect(result.status).toBe(BookingStatus.PENDING);
    });
  });

  describe('updateStatus', () => {
    it('should throw BadRequestException if trying to transition CANCELLED to COMPLETED', async () => {
      const existingBooking = {
        id: 'booking-id',
        customerName: 'John Doe',
        userId: 'user-uuid-123',
        status: BookingStatus.CANCELLED,
      };
      mockBookingRepository.findOne.mockResolvedValue(existingBooking);

      await expect(
        service.updateStatus('booking-id', { status: BookingStatus.COMPLETED }, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully update status if valid transition', async () => {
      const existingBooking = {
        id: 'booking-id',
        customerName: 'John Doe',
        userId: 'user-uuid-123',
        status: BookingStatus.PENDING,
      };
      mockBookingRepository.findOne.mockResolvedValue(existingBooking);
      mockBookingRepository.save.mockImplementation((b) => Promise.resolve(b));

      const result = await service.updateStatus('booking-id', { status: BookingStatus.CONFIRMED }, mockUser);
      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });
  });
});
