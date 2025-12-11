import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Target, TargetSchema } from './schemas/target.schema';
import { TargetsService } from './targets.service';
import { TargetsController } from './targets.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Target.name, schema: TargetSchema }])],
  providers: [TargetsService],
  controllers: [TargetsController],
})
export class TargetsModule {}

