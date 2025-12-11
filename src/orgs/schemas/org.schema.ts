import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrgDocument = Org & Document;

@Schema({ timestamps: true })
export class Org {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  ownerId: string;
}

export const OrgSchema = SchemaFactory.createForClass(Org);


