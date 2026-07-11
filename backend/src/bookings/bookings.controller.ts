import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ClaimBookingsDto } from './dto/claim-bookings.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { GetBookingsFilterDto } from './dto/get-bookings-filter.dto';
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new service booking (Authenticated Customer)',
  })
  @ApiResponse({ status: 201, description: 'Booking successfully created.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid details or date is in the past.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Service not found.' })
  @ApiResponse({ status: 409, description: 'Timeslot already booked.' })
  create(@Body() createBookingDto: CreateBookingDto, @Req() req: any) {
    return this.bookingsService.create(createBookingDto, req.user);
  }

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim guest bookings for the logged-in user' })
  @ApiResponse({ status: 200, description: 'Bookings successfully claimed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  claim(@Body() claimBookingsDto: ClaimBookingsDto, @Req() req: any) {
    return this.bookingsService.claim(claimBookingsDto.bookingIds, req.user);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get booking statistics (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Return booking stats.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  getStats(@Query() filterDto: GetBookingsFilterDto, @Req() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can view statistics');
    }
    return this.bookingsService.getStats(filterDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Get bookings list. Customers see their own; Admins see all. (Authenticated)',
  })
  @ApiResponse({ status: 200, description: 'Return paginated bookings list.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Query() filterDto: GetBookingsFilterDto, @Req() req: any) {
    return this.bookingsService.findAll(filterDto, req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get a specific booking details (Authenticated owner or admin)',
  })
  @ApiParam({ name: 'id', description: 'The booking UUID' })
  @ApiResponse({ status: 200, description: 'Return the booking details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. No ownership.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.bookingsService.findOne(id, req.user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a booking status (Authenticated owner or admin)',
  })
  @ApiParam({ name: 'id', description: 'The booking UUID' })
  @ApiResponse({
    status: 200,
    description: 'Booking status successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or invalid status transition.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. No ownership.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
    @Req() req: any,
  ) {
    return this.bookingsService.updateStatus(
      id,
      updateBookingStatusDto,
      req.user,
    );
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel a booking (Authenticated owner or admin)' })
  @ApiParam({ name: 'id', description: 'The booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking successfully cancelled.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. No ownership.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.bookingsService.cancel(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Reschedule or edit a booking (Authenticated owner or admin)',
  })
  @ApiParam({ name: 'id', description: 'The booking UUID' })
  @ApiResponse({
    status: 200,
    description: 'Booking successfully updated/rescheduled.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date/time or status constraints.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. No ownership.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Req() req: any,
  ) {
    return this.bookingsService.update(id, updateBookingDto, req.user);
  }
}
