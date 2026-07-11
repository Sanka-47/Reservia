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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../users/entities/user.entity");
const bookings_service_1 = require("./bookings.service");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const claim_bookings_dto_1 = require("./dto/claim-bookings.dto");
const update_booking_status_dto_1 = require("./dto/update-booking-status.dto");
const update_booking_dto_1 = require("./dto/update-booking.dto");
const get_bookings_filter_dto_1 = require("./dto/get-bookings-filter.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let BookingsController = class BookingsController {
    bookingsService;
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    create(createBookingDto, req) {
        return this.bookingsService.create(createBookingDto, req.user);
    }
    claim(claimBookingsDto, req) {
        return this.bookingsService.claim(claimBookingsDto.bookingIds, req.user);
    }
    getStats(filterDto, req) {
        if (req.user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only administrators can view statistics');
        }
        return this.bookingsService.getStats(filterDto);
    }
    findAll(filterDto, req) {
        return this.bookingsService.findAll(filterDto, req.user);
    }
    findOne(id, req) {
        return this.bookingsService.findOne(id, req.user);
    }
    updateStatus(id, updateBookingStatusDto, req) {
        return this.bookingsService.updateStatus(id, updateBookingStatusDto, req.user);
    }
    cancel(id, req) {
        return this.bookingsService.cancel(id, req.user);
    }
    update(id, updateBookingDto, req) {
        return this.bookingsService.update(id, updateBookingDto, req.user);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new service booking (Authenticated Customer)',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Booking successfully created.' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid details or date is in the past.',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service not found.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Timeslot already booked.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_booking_dto_1.CreateBookingDto, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('claim'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Claim guest bookings for the logged-in user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bookings successfully claimed.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [claim_bookings_dto_1.ClaimBookingsDto, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "claim", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking statistics (Admin Only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return booking stats.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Admin role required.' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_bookings_filter_dto_1.GetBookingsFilterDto, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get bookings list. Customers see their own; Admins see all. (Authenticated)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return paginated bookings list.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_bookings_filter_dto_1.GetBookingsFilterDto, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a specific booking details (Authenticated owner or admin)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'The booking UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the booking details.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. No ownership.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a booking status (Authenticated owner or admin)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'The booking UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booking status successfully updated.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid request or invalid status transition.',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. No ownership.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_booking_status_dto_1.UpdateBookingStatusDto, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a booking (Authenticated owner or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'The booking UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking successfully cancelled.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. No ownership.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Reschedule or edit a booking (Authenticated owner or admin)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'The booking UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booking successfully updated/rescheduled.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid date/time or status constraints.',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. No ownership.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_booking_dto_1.UpdateBookingDto, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "update", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('Bookings'),
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map