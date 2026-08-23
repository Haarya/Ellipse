import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private redis: Redis;

  constructor(private prisma: PrismaService) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.redis.on('error', (err) => {
      console.warn('[Redis] Connection error in RateLimitGuard:', err.message);
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id;
    if (!userId) return true; // Let auth guard handle unauthorized

    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyKey = `ratelimit:daily:${userId}:${dateStr}`;
    const cooldownKey = `ratelimit:cooldown:${userId}`;

    // 1. Check cooldown (10 seconds for testing)
    const isInCooldown = await this.redis.get(cooldownKey);
    if (isInCooldown) {
      await this.logViolation(userId, req, 'COOLDOWN_VIOLATION', 'Attempted to submit within 10 seconds');
      throw new HttpException('Please wait 10 seconds before submitting another complaint', HttpStatus.TOO_MANY_REQUESTS);
    }

    // 2. Check daily limit (10 per day)
    const dailyCountStr = await this.redis.get(dailyKey);
    const dailyCount = dailyCountStr ? parseInt(dailyCountStr, 10) : 0;

    if (dailyCount >= 10) {
      await this.logViolation(userId, req, 'DAILY_LIMIT_VIOLATION', 'Exceeded 10 submissions per day');
      throw new HttpException('Daily submission limit reached', HttpStatus.TOO_MANY_REQUESTS);
    }

    // Passed checks - increment daily counter and set cooldown
    await this.redis.incr(dailyKey);
    await this.redis.expire(dailyKey, 86400); // 24 hours

    await this.redis.setex(cooldownKey, 10, '1'); // 10 sec cooldown

    return true;
  }

  private async logViolation(userId: string, req: any, action: string, reason: string) {
    await this.prisma.citizenActivityLog.create({
      data: {
        citizenId: userId,
        action: action,
        flagReason: reason,
        ipAddress: req.ip,
        flagged: true,
      },
    });
  }
}
