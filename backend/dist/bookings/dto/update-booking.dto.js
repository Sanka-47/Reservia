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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBookingDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateBookingDto {
    customerName;
    customerEmail;
    customerPhone;
    bookingDate;
    bookingTime;
    notes;
}
exports.UpdateBookingDto = UpdateBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer full name',
        example: 'Alice Smith',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer email address',
        example: 'alice@example.com',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "customerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer phone number',
        example: '+1234567890',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rescheduled booking date (format: YYYY-MM-DD)',
        example: '2026-07-16',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'bookingDate must be in YYYY-MM-DD format',
    }),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "bookingDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rescheduled booking time (format: HH:MM)',
        example: '15:00',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'bookingTime must be in HH:MM format',
    }),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "bookingTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Updated notes',
        example: 'Moved to next day.',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "notes", void 0);
//# sourceMappingURL=update-booking.dto.js.map