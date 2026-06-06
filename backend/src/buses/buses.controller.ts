import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BusesService } from './buses.service';

@ApiTags('Buses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/buses')
export class BusesController {
  constructor(private busesService: BusesService) {}

  @Get('live')
  @ApiOperation({ summary: 'Get live bus positions' })
  @ApiQuery({ name: 'routeId', required: false })
  @ApiResponse({ status: 200, description: 'Live bus positions' })
  getLiveBuses(@Query('routeId') routeId?: string) {
    return this.busesService.getLiveBuses(routeId);
  }
}
