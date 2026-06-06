import { Global, Module } from '@nestjs/common';
import { BusSimulationService } from './simulation.service';

@Global()
@Module({
  providers: [BusSimulationService],
  exports: [BusSimulationService],
})
export class SimulationModule {}
