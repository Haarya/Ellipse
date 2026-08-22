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
            wasteClasses: dto.wasteTypes,
            logisticsTier: dto.tier,
            severityScore: dto.severityScore || 0,
            category: dto.category,
            sizeEstimate: dto.sizeEstimate,
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

  @Get('analytics/overview')
  async getAnalyticsOverview() {
    const allComplaints = await this.prisma.complaint.findMany({
      include: { aiAnalysis: true }
    });

    const total = allComplaints.length;
    const resolved = allComplaints.filter(c => c.status === 'RESOLVED').length;
    const resolutionRate = total === 0 ? 0 : Math.round((resolved / total) * 100);

    // Mock trend, ward performance, and some stats for now, but compute real severity/waste
    let critical = 0;
    let moderate = 0;
    let low = 0;
    const wasteCount: Record<string, number> = {};

    allComplaints.forEach(c => {
      if (c.aiAnalysis) {
        const score = c.aiAnalysis.severityScore || 0;
        if (score >= 0.75) critical++;
        else if (score >= 0.5) moderate++;
        else low++;

        if (Array.isArray(c.aiAnalysis.wasteClasses)) {
          (c.aiAnalysis.wasteClasses as string[]).forEach((w: string) => {
            wasteCount[w] = (wasteCount[w] || 0) + 1;
          });
        }
      } else {
        low++; // Pending AI
      }
    });

    const totalAi = allComplaints.filter(c => c.aiAnalysis).length || 1; // avoid / 0

    const wasteDistribution = Object.entries(wasteCount).map(([label, count]) => {
      let color = "#FECA57";
      if (label === "Organic") color = "#2ED573";
      if (label === "Recyclables") color = "#54A0FF";
      if (label === "Hazardous") color = "#FF4D4D";
      if (label === "Bulk Dump") color = "#FF9F43";
      return {
        label,
        value: Math.round((count / totalAi) * 100),
        color
      };
    });

    return {
      stats: {
        totalComplaintsThisMonth: total,
        resolutionRate,
        avgResponseTimeHours: 12.5, // Mock
        slaComplianceRate: 85.0, // Mock
        activeHotspots: 3, // Mock
      },
      complaintsTrend: [
        { label: "Mon", value: 12 },
        { label: "Tue", value: 15 },
        { label: "Wed", value: 18 },
        { label: "Thu", value: 10 },
        { label: "Fri", value: total },
      ],
      wasteDistribution: wasteDistribution.length > 0 ? wasteDistribution : [
        { label: "No Data", value: 100, color: "#54A0FF" }
      ],
      wardPerformance: [
        { ward: "Ward 1", resolutionRate: resolutionRate, total: total },
      ],
      severityBreakdown: [
        { label: "Critical", value: total === 0 ? 0 : Math.round((critical / total) * 100), color: "#FF4D4D" },
        { label: "Moderate", value: total === 0 ? 0 : Math.round((moderate / total) * 100), color: "#FF9F43" },
        { label: "Low", value: total === 0 ? 0 : Math.round((low / total) * 100), color: "#FECA57" },
      ]
    };
  }
}
