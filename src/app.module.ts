import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthController } from './health.controller';
import { OrgsModule } from './orgs/orgs.module';
import { DesignationsModule } from './designations/designations.module';
import { TargetsModule } from './targets/targets.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Lightweight env validation without extra deps
      validate: (config) => {
        const validated = {
          MONGODB_URI: config.MONGODB_URI,
          JWT_SECRET: config.JWT_SECRET,
          PORT: config.PORT || '3000',
        };

        if (!validated.MONGODB_URI) {
          throw new Error('MONGODB_URI is required');
        }
        if (!validated.JWT_SECRET) {
          throw new Error('JWT_SECRET is required');
        }
        return validated;
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    TasksModule,
    UsersModule,
    AuthModule,
    OrgsModule,
    DesignationsModule,
    TargetsModule,
    ChatModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [HealthController],
})
export class AppModule {}

