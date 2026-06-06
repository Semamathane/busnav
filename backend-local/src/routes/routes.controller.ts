import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RoutesService } from './routes.service';

@ApiTags('Routes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Get()
  @ApiOperation({ summary: 'List all routes' })
  @ApiQuery({ name: 'type', required: false, enum: ['ARE_YENG', 'TBS'] })
  @ApiResponse({ status: 200, description: 'List of routes' })
  listRoutes(@Query('type') type?: string) {
    return this.routesService.listRoutes(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route detail' })
  @ApiResponse({ status: 200, description: 'Route detail' })
  getRouteDetail(@Param('id') id: string) {
    return this.routesService.getRouteDetail(id);
  }

  @Get(':id/eta')
  @ApiOperation({ summary: 'Get route ETA with stops timeline' })
  @ApiResponse({ status: 200, description: 'Route ETA' })
  getRouteEta(@Param('id') id: string) {
    return this.routesService.getRouteEta(id);
  }
}
