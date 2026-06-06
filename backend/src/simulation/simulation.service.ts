import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusSimulationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BusSimulationService.name);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log('Starting bus simulation (10s interval)');
    this.intervalId = setInterval(() => this.tick(), 10000);
    // Run once immediately
    this.tick();
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async tick() {
    try {
      const buses = await this.prisma.bus.findMany({
        where: { status: { not: 'OUT_OF_SERVICE' } },
        include: {
          route: {
            include: {
              routeStops: {
                include: { stop: true },
                orderBy: { stopOrder: 'asc' },
              },
            },
          },
        },
      });

      for (const bus of buses) {
        const stops = bus.route?.routeStops ?? [];
        if (stops.length < 2) continue;

        let nextIdx = bus.currentStopIndex + 1;
        if (nextIdx >= stops.length) {
          nextIdx = 0; // loop back
        }

        const nextStop = stops[nextIdx]?.stop;
        if (!nextStop) continue;

        // Interpolate position: move 30% of remaining distance toward next stop
        const currentLat = bus.currentLatitude;
        const currentLng = bus.currentLongitude;
        const targetLat = nextStop.latitude;
        const targetLng = nextStop.longitude;

        const dist = Math.sqrt(
          (targetLat - currentLat) ** 2 + (targetLng - currentLng) ** 2,
        );

        let newLat: number;
        let newLng: number;
        let newStopIdx = bus.currentStopIndex;

        if (dist < 0.0005) {
          // Close enough to stop, snap to it and advance
          newLat = targetLat;
          newLng = targetLng;
          newStopIdx = nextIdx;
        } else {
          // Move toward next stop
          const factor = 0.4;
          newLat = currentLat + (targetLat - currentLat) * factor;
          newLng = currentLng + (targetLng - currentLng) * factor;
        }

        // Calculate heading
        const heading = this.calculateHeading(currentLat, currentLng, newLat, newLng);
        const speed = dist < 0.0005 ? 0 : 30 + Math.random() * 20; // 30-50 km/h

        // Random delay (5% chance)
        let delayMinutes = bus.delayMinutes;
        if (Math.random() < 0.05) {
          delayMinutes = Math.floor(Math.random() * 6);
        } else if (delayMinutes > 0 && Math.random() < 0.3) {
          delayMinutes = Math.max(0, delayMinutes - 1);
        }

        const status = delayMinutes > 2 ? 'DELAYED' : 'ON_TIME';

        await this.prisma.bus.update({
          where: { id: bus.id },
          data: {
            currentLatitude: newLat,
            currentLongitude: newLng,
            heading,
            speed,
            currentStopIndex: newStopIdx,
            delayMinutes,
            status,
          },
        });
      }
    } catch (error) {
      this.logger.error('Simulation tick error', error);
    }
  }

  getAverageInterStopTime(routeStops: { estimatedTimeFromPrevious?: number | null }[]): number {
    const times = routeStops
      .map((rs) => rs.estimatedTimeFromPrevious)
      .filter((t): t is number => t != null && t > 0);
    if (times.length === 0) return 180; // default 3 min
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  private calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const toDeg = (r: number) => (r * 180) / Math.PI;
    const dLng = toRad(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(toRad(lat2));
    const x =
      Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }
}
