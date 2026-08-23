import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/v1/internal/crews')
export class InternalCrewsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getCrews() {
    const users = await this.prisma.user.findMany({
      where: { role: 'FIELD_CREW' }
    });
    
    return users.map(user => ({
      id: user.id,
      name: user.fullName,
      status: 'AVAILABLE',
      latitude: 19.076 + (Math.random() * 0.1 - 0.05),
      longitude: 72.8777 + (Math.random() * 0.1 - 0.05),
      vehicle: 'MINI_TRUCK',
      lastPing: new Date().toISOString()
    }));
  }

  @Post()
  async createCrew(@Body() body: { name: string; vehicle: string; zone: string }) {
    const newUser = await this.prisma.user.create({
      data: {
        fullName: body.name,
        role: 'FIELD_CREW',
        email: `crew_${Date.now()}@ellipse.com`
      }
    });

    return {
      id: newUser.id,
      name: newUser.fullName,
      status: 'AVAILABLE',
      latitude: 19.076,
      longitude: 72.8777,
      vehicle: body.vehicle || 'MINI_TRUCK',
      lastPing: new Date().toISOString()
    };
  }
}

