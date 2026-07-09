import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.client = new OAuth2Client(clientId);
  }

  async verify(token: string) {
    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      // Check email exists in payload
      if (!payload.email) {
        throw new UnauthorizedException('Email is missing from Google token payload');
      }

      return {
        email: payload.email,
        name: payload.name || 'Google User',
        googleId: payload.sub,
      };
    } catch (error: any) {
      throw new UnauthorizedException(`Invalid Google token: ${error.message}`);
    }
  }
}
