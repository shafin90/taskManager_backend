import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Designation, DesignationSchema } from './schemas/designation.schema';
import { DesignationsService } from './designations.service';
import { DesignationsController } from './designations.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Designation.name, schema: DesignationSchema }])],
  providers: [DesignationsService],
  controllers: [DesignationsController],
  exports: [DesignationsService],
})
export class DesignationsModule {}


