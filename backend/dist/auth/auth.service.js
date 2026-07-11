"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
const user_entity_1 = require("../users/entities/user.entity");
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    usersService;
    jwtService;
    configService;
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    async register(registerDto) {
        const { username, password, email, name, gender, phoneNumber, dob } = registerDto;
        let existing = await this.usersService.findOneByUsername(username);
        if (existing) {
            throw new common_1.ConflictException('Username is already taken');
        }
        existing = await this.usersService.findOneByEmail(email);
        if (existing) {
            throw new common_1.ConflictException('Email address is already registered');
        }
        const passwordHash = this.hashPassword(password);
        const user = await this.usersService.create({
            username,
            passwordHash,
            email,
            name,
            gender,
            phoneNumber,
            dob,
            role: user_entity_1.UserRole.CUSTOMER,
        });
        return this.generateTokensResponse(user);
    }
    async login(username, password) {
        const user = await this.usersService.findOneByUsername(username);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        const inputHash = this.hashPassword(password);
        if (user.passwordHash !== inputHash) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        return this.generateTokensResponse(user);
    }
    async refreshTokens(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const userId = payload.sub;
            const user = await this.usersService.findOneById(userId);
            if (!user || !user.refreshTokenHash) {
                throw new common_1.UnauthorizedException('Access denied or invalid session');
            }
            const tokenHash = this.hashToken(refreshToken);
            if (user.refreshTokenHash !== tokenHash) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            return this.generateTokensResponse(user);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    async logout(userId) {
        await this.usersService.update(userId, { refreshTokenHash: null });
        return { message: 'Logged out successfully' };
    }
    async generateTokensResponse(user) {
        const payload = { sub: user.id, username: user.username, role: user.role };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_SECRET') ??
                'super_secret_jwt_key_change_me',
            expiresIn: '15m',
        });
        const refreshToken = await this.jwtService.signAsync({ sub: user.id }, {
            secret: this.configService.get('JWT_REFRESH_SECRET') ??
                'super_secret_refresh_jwt_key_change_me',
            expiresIn: '7d',
        });
        const refreshTokenHash = this.hashToken(refreshToken);
        await this.usersService.update(user.id, { refreshTokenHash });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                gender: user.gender,
                phoneNumber: user.phoneNumber,
                dob: user.dob,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map