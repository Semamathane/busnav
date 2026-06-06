import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROUTES_DATA = [
  {
    routeNumber: '402',
    name: 'CBD \u2192 Menlyn Park',
    startPoint: 'CBD',
    endPoint: 'Menlyn Park',
    color: '#0B5FB0',
    type: 'ARE_YENG' as const,
    stops: [
      { name: 'Church Square', latitude: -25.7479, longitude: 28.1882, address: 'Church Square, Pretoria CBD' },
      { name: 'Pretoria Station', latitude: -25.7536, longitude: 28.1862, address: 'Scheiding St, Pretoria' },
      { name: 'Union Buildings', latitude: -25.7410, longitude: 28.2120, address: 'Government Ave, Arcadia' },
      { name: 'Loftus Park', latitude: -25.7530, longitude: 28.2280, address: 'Kirkness St, Arcadia' },
      { name: 'Hatfield Station', latitude: -25.7480, longitude: 28.2380, address: 'Station Rd, Hatfield' },
      { name: 'Hatfield Plaza', latitude: -25.7460, longitude: 28.2350, address: 'Burnett St, Hatfield' },
      { name: 'Brooklyn Mall', latitude: -25.7680, longitude: 28.2410, address: 'Veale St, Brooklyn' },
      { name: 'Menlyn Park', latitude: -25.7830, longitude: 28.2770, address: 'Atterbury Rd, Menlyn' },
    ],
  },
  {
    routeNumber: '201',
    name: 'CBD \u2192 Mamelodi',
    startPoint: 'CBD',
    endPoint: 'Mamelodi',
    color: '#1FA463',
    type: 'ARE_YENG' as const,
    stops: [
      { name: 'Church Square', latitude: -25.7479, longitude: 28.1882, address: 'Church Square, Pretoria CBD' },
      { name: 'Bosman Station', latitude: -25.7550, longitude: 28.1900, address: 'Bosman St, Pretoria' },
      { name: 'Pretoria East', latitude: -25.7400, longitude: 28.2200, address: 'Eastwood Rd, Arcadia' },
      { name: 'Silverton', latitude: -25.7350, longitude: 28.2600, address: 'Pretoria Rd, Silverton' },
      { name: 'Denneboom Station', latitude: -25.7300, longitude: 28.2900, address: 'Denneboom Rd' },
      { name: 'Mahube Valley', latitude: -25.7100, longitude: 28.3500, address: 'Mahube Valley' },
      { name: 'Mamelodi West', latitude: -25.7050, longitude: 28.3700, address: 'Tsamaya Rd, Mamelodi West' },
      { name: 'Mamelodi East', latitude: -25.7000, longitude: 28.3900, address: 'Stormvoël Rd, Mamelodi East' },
    ],
  },
  {
    routeNumber: '115',
    name: 'Hatfield \u2192 Wonderboom',
    startPoint: 'Hatfield',
    endPoint: 'Wonderboom',
    color: '#F2A900',
    type: 'TBS' as const,
    stops: [
      { name: 'Hatfield Station', latitude: -25.7480, longitude: 28.2380, address: 'Station Rd, Hatfield' },
      { name: 'Loftus Versfeld', latitude: -25.7530, longitude: 28.2280, address: 'Kirkness St, Sunnyside' },
      { name: 'Arcadia', latitude: -25.7450, longitude: 28.2100, address: 'Park St, Arcadia' },
      { name: 'Union Buildings', latitude: -25.7410, longitude: 28.2120, address: 'Government Ave, Arcadia' },
      { name: 'Pretoria CBD', latitude: -25.7479, longitude: 28.1882, address: 'Church Square, CBD' },
      { name: 'Capital Park', latitude: -25.7200, longitude: 28.1850, address: 'Johann Rissik Dr, Capital Park' },
      { name: 'Wonderboom Junction', latitude: -25.6900, longitude: 28.1800, address: 'Lavender Rd, Wonderboom' },
      { name: 'Wonderboom Airport', latitude: -25.6540, longitude: 28.2240, address: 'Airport Rd, Wonderboom' },
    ],
  },
  {
    routeNumber: '307',
    name: 'Menlyn \u2192 Atteridgeville',
    startPoint: 'Menlyn',
    endPoint: 'Atteridgeville',
    color: '#E04438',
    type: 'TBS' as const,
    stops: [
      { name: 'Menlyn Park', latitude: -25.7830, longitude: 28.2770, address: 'Atterbury Rd, Menlyn' },
      { name: 'Sunnyside', latitude: -25.7600, longitude: 28.2100, address: 'Esselen St, Sunnyside' },
      { name: 'Pretoria CBD', latitude: -25.7479, longitude: 28.1882, address: 'Church Square, CBD' },
      { name: 'Church Square', latitude: -25.7479, longitude: 28.1880, address: 'Church Square' },
      { name: 'Pretoria West', latitude: -25.7500, longitude: 28.1600, address: 'Church St W, Pretoria West' },
      { name: 'Saulsville', latitude: -25.7600, longitude: 28.1200, address: 'Saulsville' },
      { name: 'Atteridgeville', latitude: -25.7700, longitude: 28.1000, address: 'Atteridgeville' },
    ],
  },
];

const BUSES_PER_ROUTE = [
  { plate: 'A', count: 3 },
  { plate: 'B', count: 2 },
  { plate: 'C', count: 2 },
  { plate: 'D', count: 3 },
];

async function main() {
  // Seed test user
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'John Doe',
    },
  });
  console.log('Test user seeded');

  for (let ri = 0; ri < ROUTES_DATA.length; ri++) {
    const rd = ROUTES_DATA[ri];
    // Upsert route
    const route = await prisma.route.upsert({
      where: { routeNumber: rd.routeNumber },
      update: {
        name: rd.name,
        startPoint: rd.startPoint,
        endPoint: rd.endPoint,
        color: rd.color,
        type: rd.type,
      },
      create: {
        routeNumber: rd.routeNumber,
        name: rd.name,
        startPoint: rd.startPoint,
        endPoint: rd.endPoint,
        color: rd.color,
        type: rd.type,
      },
    });
    console.log(`Route ${rd.routeNumber} seeded: ${route.id}`);

    // Upsert stops and route_stops
    for (let si = 0; si < rd.stops.length; si++) {
      const sd = rd.stops[si];
      // Find or create stop by name + coords
      let stop = await prisma.stop.findFirst({
        where: {
          name: sd.name,
          latitude: sd.latitude,
          longitude: sd.longitude,
        },
      });
      if (!stop) {
        stop = await prisma.stop.create({
          data: {
            name: sd.name,
            latitude: sd.latitude,
            longitude: sd.longitude,
            address: sd.address,
          },
        });
      }

      // Calculate distance from previous stop
      let distFromPrev: number | null = null;
      let timeFromPrev: number | null = null;
      if (si > 0) {
        const prev = rd.stops[si - 1];
        distFromPrev = haversine(prev.latitude, prev.longitude, sd.latitude, sd.longitude);
        // Assume avg 30km/h = 500m/min = 8.33m/s
        timeFromPrev = Math.round(distFromPrev / 8.33);
      }

      // Upsert route_stop
      const existingRS = await prisma.route_stop.findUnique({
        where: { routeId_stopOrder: { routeId: route.id, stopOrder: si + 1 } },
      });
      if (!existingRS) {
        await prisma.route_stop.create({
          data: {
            routeId: route.id,
            stopId: stop.id,
            stopOrder: si + 1,
            distanceFromPrevious: distFromPrev,
            estimatedTimeFromPrevious: timeFromPrev,
          },
        });
      }
    }

    // Seed buses
    const busConfig = BUSES_PER_ROUTE[ri];
    for (let bi = 0; bi < busConfig.count; bi++) {
      const plate = `GP-BUS-${rd.routeNumber}${String.fromCharCode(65 + bi)}`;
      const startIdx = Math.floor((bi / busConfig.count) * rd.stops.length);
      const startStop = rd.stops[startIdx];

      await prisma.bus.upsert({
        where: { licensePlate: plate },
        update: {
          routeId: route.id,
          currentLatitude: startStop.latitude,
          currentLongitude: startStop.longitude,
          currentStopIndex: startIdx,
        },
        create: {
          routeId: route.id,
          licensePlate: plate,
          currentLatitude: startStop.latitude,
          currentLongitude: startStop.longitude,
          heading: 0,
          speed: 0,
          currentStopIndex: startIdx,
        },
      });
    }
    console.log(`Buses for route ${rd.routeNumber} seeded`);
  }

  console.log('Seed complete!');
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
