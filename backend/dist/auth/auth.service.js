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
const google_auth_service_1 = require("./google-auth.service");
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    usersService;
    googleAuthService;
    jwtService;
    configService;
    constructor(usersService, googleAuthService, jwtService, configService) {
        this.usersService = usersService;
        this.googleAuthService = googleAuthService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    async registerGoogle(token) {
        const googlePayload = await this.googleAuthService.verify(token);
        let user = await this.usersService.findOneByGoogleId(googlePayload.googleId);
        if (!user) {
            user = await this.usersService.findOneByEmail(googlePayload.email);
        }
        if (user) {
            throw new common_1.ConflictException('User with this email or Google account already registered');
        }
        const newUser = await this.usersService.create({
            email: googlePayload.email,
            name: googlePayload.name,
            googleId: googlePayload.googleId,
        });
        return this.generateTokensResponse(newUser);
    }
    async loginGoogle(token) {
        const googlePayload = await this.googleAuthService.verify(token);
        let user = await this.usersService.findOneByGoogleId(googlePayload.googleId);
        if (!user) {
            user = await this.usersService.findOneByEmail(googlePayload.email);
            if (user) {
                user = await this.usersService.update(user.id, { googleId: googlePayload.googleId });
            }
        }
        if (!user) {
            throw new common_1.UnauthorizedException('User not registered. Please register first.');
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
        const payload = { sub: user.id, email: user.email };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: '15m',
        });
        const refreshToken = await this.jwtService.signAsync({ sub: user.id }, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });
        const refreshTokenHash = this.hashToken(refreshToken);
        await this.usersService.update(user.id, { refreshTokenHash });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        google_auth_service_1.GoogleAuthService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map