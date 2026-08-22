import { Module } from '@nestjs/common';
import { InternalController } from './internal.controller';
import { EventsGateway } from './events.gateway';

import { InternalCrewsController } from './internal-crews.controller';

@Module({
  controllers: [InternalController, InternalCrewsController],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class InternalModule {}
