import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusSimulationService } from '../simulation/simulation.service';

@Injectable()
export class StopsService {
  private readonly logger = new Logger(StopsService.name);

  constructor(
    private prisma: PrismaService,
    private simulation: BusSimulationService,
  ) {}

  async listStops(routeId?: string) {
    if (routeId) {
      const routeStops = await this.prisma.route_stop.findMany({
        where: { routeId },
        include: { stop: true },
        orderBy: { stopOrder: 'asc' },
      });
      return {
        items: routeStops.map((rs) => ({
          id: rs.stop?.id,
          name: rs.stop?.name,
          latitude: rs.stop?.latitude,
          longitude: rs.stop?.longitude,
          address: rs.stop?.address ?? null,
        })),
      };
    }
    const stops = await this.prisma.stop.findMany();
    return {
      items: stops.map((s) => ({
        id: s.id,
        name: s.name,
        latitude: s.latitude,
        longitude: s.longitude,
        address: s.address ?? null,
      })),
    };
  }

  async getNearbyStops(lat: number, lng: number, radius: number = 2000) {
    // Simple distance calculation using Haversine approximation
    // 1 degree lat ≈ 111320m, 1 degree lng ≈ 111320 * cos(lat)
    const latDelta = radius / 111320;
    const lngDelta = radius / (111320 * Math.cos((lat * Math.PI) / 180));

    const stops = await this.prisma.stop.findMany({
      where: {
        latitude: { gte: lat - latDelta, lte: lat + latDelta },
        longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
      },
      include: {
        routeStops: {
          include: {
            route: true,
          },
        },
      },
    });

    const items = stops
      .map((s) => {
        const dist = this.haversine(lat, lng, s.latitude, s.longitude);
        if (dist > radius) return null;
        return {
          id: s.id,
          name: s.name,
          latitude: s.latitude,
          longitude: s.longitude,
          address: s.address ?? null,
          distanceMeters: Math.round(dist),
          routes: (s.routeStops ?? []).map((rs) => ({
            routeId: rs.route?.id,
            routeNumber: rs.route?.routeNumber,
            routeName: rs.route?.name,
            type: rs.route?.type,
            color: rs.route?.color,
          })),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    return { items };
  }

  async getStopEta(stopId: string) {
    const stop = await this.prisma.stop.findUnique({
      where: { id: stopId },
      include: {
        routeStops: {
          include: {
            route: {
              include: {
                buses: true,
                routeStops: { orderBy: { stopOrder: 'asc' } },
              },
            },
          },
        },
      },
    });
    if (!stop) throw new NotFoundException('Stop not found');

    const upcomingBuses: any[] = [];

    for (const rs of stop.routeStops ?? []) {
      const route = rs.route;
      if (!route) continue;
      const activeBuses = (route.buses ?? []).filter((b) => b.status !== 'OUT_OF_SERVICE');
      const avgTime = this.simulation.getAverageInterStopTime(route.routeStops ?? []);

      for (const bus of activeBuses) {
        const stopIdx = rs.stopOrder - 1; // 0-based
        const stopsAway = stopIdx - bus.currentStopIndex;
        if (stopsAway <= 0) continue; // bus already passed this stop

        const dist = stopsAway * 500; // rough estimate
        const etaSeconds = Math.round(stopsAway * avgTime + bus.delayMinutes * 60);

        upcomingBuses.push({
          busId: bus.id,
          routeId: route.id,
          routeNumber: route.routeNumber,
          routeName: route.name,
          routeType: route.type,
          routeColor: route.color,
          status: bus.status === 'ON_TIME' ? 'ON_TIME' : 'DELAYED',
          etaSeconds,
          stopsAway,
          distanceMeters: dist,
          delayMinutes: bus.delayMinutes,
        });
      }
    }

    upcomingBuses.sort((a, b) => a.etaSeconds - b.etaSeconds);

    return {
      stopId: stop.id,
      stopName: stop.name,
      upcomingBuses,
    };
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
