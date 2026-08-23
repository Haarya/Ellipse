import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ComplaintsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async submit(userId: string, dto: CreateComplaintDto, file: Express.Multer.File) {
    if (!file) {
      throw new InternalServerErrorException('Photo is required');
    }

    // 1. Upload photo to Supabase Storage
    const filename = `${userId}/${randomUUID()}.jpg`;
    const photoUrl = await this.storage.uploadPhoto(file.buffer, filename);

    // 2. Save complaint in DB
    // We use a raw SQL insert if we want to set the PostGIS Geography column directly.
    // Or we create the record first, then update the geography column.
    
    const complaint = await this.prisma.complaint.create({
      data: {
        citizenId: userId,
        rawImageUrl: photoUrl,
        latitude: dto.latitude,
        longitude: dto.longitude,
        compassHeading: dto.compassHeading,
      },
    });

    // Update the PostGIS geography column (Prisma doesn't support writing to it natively during create)
    await this.prisma.$executeRawUnsafe(
      `UPDATE complaints SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3`,
      dto.longitude, dto.latitude, complaint.id
    );

    // 3. Call AI Service asynchronously
    try {
      fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId: complaint.id,
          imageUrl: photoUrl,
          sizeEstimate: dto.sizeEstimate,
          focalLength: dto.focalLength,
          sensorWidth: dto.sensorWidth,
          sensorHeight: dto.sensorHeight,
          zoomRatio: dto.zoomRatio,
        }),
      }).catch(err => console.error('Failed to call AI service:', err));
    } catch (error) {
      console.error('Error initiating AI processing:', error);
    }

    return {
      message: 'Complaint submitted successfully',
      complaint,
    };
  }

  async findByUser(userId: string) {
    return this.prisma.complaint.findMany({
      where: { citizenId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        aiAnalysis: true,
      },
    });
  }

  async findNearby() {
    return this.prisma.complaint.findMany({
      where: {
        status: {
          notIn: ['RESOLVED', 'REJECTED'],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to 100 for MVP
      include: {
        aiAnalysis: true,
      },
    });
  }

  async findById(id: string, userId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        aiAnalysis: true,
      },
    });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    return complaint;
  }
}
