import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StopsService } from './stops.service';

@ApiTags('Stops')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/stops')
export class StopsController {
  constructor(private stopsService: StopsService) {}

  @Get()
  @ApiOperation({ summary: 'List all stops' })
  @ApiQuery({ name: 'routeId', required: false })
  @ApiResponse({ status: 200, description: 'List of stops' })
  listStops(@Query('routeId') routeId?: string) {
    return this.stopsService.listStops(routeId);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby stops' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Nearby stops' })
  getNearbyStops(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.stopsService.getNearbyStops(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseInt(radius, 10) : 2000,
    );
  }

  @Get(':id/eta')
  @ApiOperation({ summary: 'Get ETAs for buses approaching a stop' })
  @ApiResponse({ status: 200, description: 'Stop ETA' })
  getStopEta(@Param('id') id: string) {
    return this.stopsService.getStopEta(id);
  }
}
