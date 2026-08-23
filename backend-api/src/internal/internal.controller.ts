import { Controller, Patch, Param, Body, UseGuards, NotFoundException, Get } from '@nestjs/common';
import { InternalGuard } from './internal.guard';
import { AiResultsDto } from './dto/ai-results.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from './events.gateway';

@Controller('api/v1/internal/complaints')
@UseGuards(InternalGuard)
export class InternalController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Get()
  async getAllComplaints() {
    return this.prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        aiAnalysis: true,
      }
    });
  }

  @Patch(':id/ai-results')
  async updateAiResults(@Param('id') id: string, @Body() dto: AiResultsDto) {
    // 1. Check if complaint exists
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    // 2. Update complaint status to AI_TRIAGED
    const updatedComplaint = await this.prisma.complaint.update({
      where: { id },
      data: {
        status: 'AI_TRIAGED',
        aiAnalysis: {
          create: {
            wasteClasses: dto.classification.wasteTypes,
            logisticsTier: dto.dispatchRecommendation.tier,
            severityScore: dto.dispatchRecommendation.severityScore,
            category: dto.classification.macroCategory,
            macroCategory: dto.classification.macroCategory,
            microCategory: dto.classification.microCategory,
            volumeM3: dto.spatialMetrics.volumeM3,
            volumeConfidence: dto.spatialMetrics.volumeConfidence === "MEDIUM" ? "MEDIUM" : "LOW",
            // Assuming weight version 1 exists for now, since it's an Int relation
            severityWeightVersionId: 1, 
          },
        },
      },
      include: {
        aiAnalysis: true,
      }
    });

    // 3. Broadcast the event via Socket.IO
    this.eventsGateway.broadcastComplaintTriaged(id, {
      status: updatedComplaint.status,
      aiAnalysis: updatedComplaint.aiAnalysis,
    });

    return {
      message: 'AI results processed successfully',
      complaint: updatedComplaint,
    };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: any) {
    const updatedComplaint = await this.prisma.complaint.update({
      where: { id },
      data: { status },
      include: {
        aiAnalysis: true,
      }
    });

    // Broadcast the event via Socket.IO so mobile apps see the change instantly if connected
    this.eventsGateway.broadcastComplaintTriaged(id, {
      status: updatedComplaint.status,
      aiAnalysis: updatedComplaint.aiAnalysis,
    });

    return {
      message: 'Status updated successfully',
      complaint: updatedComplaint,
    };
  }
}
