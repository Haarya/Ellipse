import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';
import { RegisterDto, SendOtpDto, VerifyOtpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private redis: Redis;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.redis.on('error', (err) => {
      console.warn('[Redis] Connection error in AuthService:', err.message);
    });
  }

  private generateOtp(): string {
    // Return a 6-digit number as string
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(dto: SendOtpDto) {
    const identifier = dto.phone || dto.email;
    if (!identifier) throw new BadRequestException('Email or phone required');

    const otp = this.generateOtp();
    
    // Store OTP in Redis with 2-minute TTL (120 seconds)
    await this.redis.setex(`otp:${identifier}`, 120, otp);

    // TODO: Actually send SMS or Email here. For now, just log it.
    console.log(`[DEBUG] OTP for ${identifier} is ${otp}`);
    
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const identifier = dto.phone || dto.email;
    if (!identifier) throw new BadRequestException('Email or phone required');

    const storedOtp = await this.redis.get(`otp:${identifier}`);
    if (!storedOtp || storedOtp !== dto.otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // OTP is valid, check if user exists to login
    const user = await this.prisma.user.findFirst({
      where: dto.phone ? { phone: dto.phone } : { email: dto.email }
    });

    if (!user) {
      // Need to register
      return { 
        message: 'OTP verified, please register', 
        registered: false,
      };
    }

    // Delete OTP
    await this.redis.del(`otp:${identifier}`);

    // Login successful
    const payload = { sub: user.id, role: user.role };
    return {
      message: 'Login successful',
      registered: true,
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async register(dto: RegisterDto) {
    const identifier = dto.phone || dto.email;
    if (!identifier) throw new BadRequestException('Email or phone required');

    const storedOtp = await this.redis.get(`otp:${identifier}`);
    if (!storedOtp || storedOtp !== dto.otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Verify if user already exists
    const existing = await this.prisma.user.findFirst({
      where: dto.phone ? { phone: dto.phone } : { email: dto.email }
    });

    if (existing) {
      throw new BadRequestException('User already exists');
    }

    // Register user
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        role: 'CITIZEN', // Default
      },
    });

    // Delete OTP
    await this.redis.del(`otp:${identifier}`);

    // Login
    const payload = { sub: user.id, role: user.role };
    return {
      message: 'Registration successful',
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        cleanCityCredits: true,
        createdAt: true,
      }
    });
    
    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  async updateRole(userId: string, role: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: {
        id: true,
        role: true,
      }
    });
    return user;
  }
}
