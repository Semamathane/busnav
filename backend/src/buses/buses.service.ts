import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusesService {
  private readonly logger = new Logger(BusesService.name);

  constructor(private prisma: PrismaService) {}

  async getLiveBuses(routeId?: string) {
    const where: any = {};
    if (routeId) {
      where.routeId = routeId;
    }

    const buses = await this.prisma.bus.findMany({
      where,
      include: {
        route: true,
      },
    });

    return {
      items: buses.map((b: any) => ({
        id: b.id,
        routeId: b.routeId,
        routeNumber: b.route?.routeNumber ?? '',
        routeType: b.route?.type ?? 'ARE_YENG',
        routeColor: b.route?.color ?? '#0B5FB0',
        currentLatitude: b.currentLatitude,
        currentLongitude: b.currentLongitude,
        heading: b.heading,
        speed: b.speed,
        status: b.status,
        currentStopIndex: b.currentStopIndex,
        nextStopName: 'Next stop', // Will be enriched by controller
        licensePlate: b.licensePlate,
      })),
      updatedAt: new Date().toISOString(),
    };
  }
}
