import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusSimulationService } from '../simulation/simulation.service';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);

  constructor(
    private prisma: PrismaService,
    private simulation: BusSimulationService,
  ) {}

  async listRoutes(type?: string) {
    const where: any = {};
    if (type) {
      where.type = type;
    }
    const routes = await this.prisma.route.findMany({
      where,
      include: {
        routeStops: {
          include: { stop: true },
          orderBy: { stopOrder: 'asc' },
        },
        buses: true,
      },
    });

    const items = routes.map((r) => {
      const stops = r.routeStops?.map((rs) => rs.stop) ?? [];
      const keyStops: string[] = [];
      if (stops.length > 0) keyStops.push(stops[0]?.name ?? '');
      if (stops.length > 2) keyStops.push(stops[Math.floor(stops.length / 2)]?.name ?? '');
      if (stops.length > 1) keyStops.push(stops[stops.length - 1]?.name ?? '');

      // Compute next bus ETA at first stop
      const activeBuses = r.buses?.filter((b) => b.status !== 'OUT_OF_SERVICE') ?? [];
      let nextBusEtaMinutes: number | null = null;
      if (activeBuses.length > 0 && r.routeStops?.length > 0) {
        const avgTime = this.simulation.getAverageInterStopTime(r.routeStops);
        let minEta = Infinity;
        for (const bus of activeBuses) {
          // ETA to complete route and come back to first stop
          const stopsToEnd = (r.routeStops?.length ?? 0) - bus.currentStopIndex;
          const eta = stopsToEnd * avgTime + bus.delayMinutes * 60;
          if (eta < minEta) minEta = eta;
        }
        if (minEta < Infinity) {
          nextBusEtaMinutes = Math.round(minEta / 60);
        }
      }

      return {
        id: r.id,
        routeNumber: r.routeNumber,
        name: r.name,
        startPoint: r.startPoint,
        endPoint: r.endPoint,
        color: r.color,
        type: r.type,
        status: r.status,
        delayMinutes: r.delayMinutes,
        stopCount: r.routeStops?.length ?? 0,
        keyStops,
        nextBusEtaMinutes,
      };
    });

    return { items };
  }

  async getRouteDetail(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        routeStops: {
          include: { stop: true },
          orderBy: { stopOrder: 'asc' },
        },
      },
    });
    if (!route) throw new NotFoundException('Route not found');

    return {
      id: route.id,
      routeNumber: route.routeNumber,
      name: route.name,
      startPoint: route.startPoint,
      endPoint: route.endPoint,
      color: route.color,
      type: route.type,
      status: route.status,
      delayMinutes: route.delayMinutes,
      isActive: route.isActive,
      stops: route.routeStops?.map((rs) => ({
        id: rs.stop?.id,
        name: rs.stop?.name,
        latitude: rs.stop?.latitude,
        longitude: rs.stop?.longitude,
        stopOrder: rs.stopOrder,
        address: rs.stop?.address ?? null,
        distanceFromPrevious: rs.distanceFromPrevious ?? null,
        estimatedTimeFromPrevious: rs.estimatedTimeFromPrevious ?? null,
      })) ?? [],
    };
  }

  async getRouteEta(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        routeStops: {
          include: { stop: true },
          orderBy: { stopOrder: 'asc' },
        },
        buses: true,
      },
    });
    if (!route) throw new NotFoundException('Route not found');

    const avgTime = this.simulation.getAverageInterStopTime(route.routeStops ?? []);
    const buses = (route.buses ?? []).map((b) => {
      const nextIdx = Math.min(b.currentStopIndex + 1, (route.routeStops?.length ?? 1) - 1);
      const nextStop = route.routeStops?.[nextIdx]?.stop;
      return {
        busId: b.id,
        licensePlate: b.licensePlate,
        status: b.status,
        currentLatitude: b.currentLatitude,
        currentLongitude: b.currentLongitude,
        heading: b.heading,
        speed: b.speed,
        currentStopIndex: b.currentStopIndex,
        nextStopName: nextStop?.name ?? 'Unknown',
        etaToNextStopSeconds: Math.round(avgTime + b.delayMinutes * 60),
        delayMinutes: b.delayMinutes,
      };
    });

    // Find the lead bus (lowest currentStopIndex among active buses)
    const activeBuses = buses.filter((b) => b.status !== 'OUT_OF_SERVICE');
    const leadBus = activeBuses.length > 0
      ? activeBuses.reduce((a, b) => (a.currentStopIndex > b.currentStopIndex ? a : b))
      : null;

    const stops = (route.routeStops ?? []).map((rs) => {
      const isPassed = leadBus ? rs.stopOrder - 1 < leadBus.currentStopIndex : false;
      let etaSeconds: number | null = null;
      if (!isPassed && leadBus) {
        const stopsAway = (rs.stopOrder - 1) - leadBus.currentStopIndex;
        if (stopsAway >= 0) {
          etaSeconds = Math.round(stopsAway * avgTime + (leadBus.delayMinutes ?? 0) * 60);
        }
      }
      return {
        id: rs.stop?.id,
        name: rs.stop?.name,
        stopOrder: rs.stopOrder,
        latitude: rs.stop?.latitude,
        longitude: rs.stop?.longitude,
        isPassed,
        etaSeconds: isPassed ? null : etaSeconds,
      };
    });

    return {
      routeId: route.id,
      routeNumber: route.routeNumber,
      routeName: route.name,
      buses,
      stops,
    };
  }
}
