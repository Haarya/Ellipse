import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleClass } from '@prisma/client';

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
      latitude: user.latitude ?? 19.076,
      longitude: user.longitude ?? 72.8777,
      vehicle: user.vehicle || 'MINI_TRUCK',
      teamSize: user.teamSize || 2,
      lastPing: new Date().toISOString()
    }));
  }

  @Post()
  async createCrew(@Body() body: { name: string; vehicle: string; zone?: string; teamSize?: number; latitude?: number; longitude?: number }) {
    const newUser = await this.prisma.user.create({
      data: {
        fullName: body.name,
        role: 'FIELD_CREW',
        email: `crew_${Date.now()}@ellipse.com`,
        vehicle: (body.vehicle as VehicleClass) || 'MINI_TRUCK',
        teamSize: body.teamSize || 2,
        latitude: body.latitude ?? 19.076,
        longitude: body.longitude ?? 72.8777,
      }
    });

    return {
      id: newUser.id,
      name: newUser.fullName,
      status: 'AVAILABLE',
      latitude: newUser.latitude,
      longitude: newUser.longitude,
      vehicle: newUser.vehicle,
      teamSize: newUser.teamSize,
      lastPing: new Date().toISOString()
    };
  }

  @Delete(':id')
  async deleteCrew(@Param('id') id: string) {
    await this.prisma.user.delete({
      where: { id }
    });
    return { success: true };
  }
}

