import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaService } from './prisma/prisma.service';
import { HealthController } from './modules/health/health.controller';
import { CatalogController } from './modules/catalog/catalog.controller';
import { CatalogService } from './modules/catalog/catalog.service';
import { OrdersController } from './modules/orders/orders.controller';
import { OrdersService } from './modules/orders/orders.service';
import { PaymentsController } from './modules/payments/payments.controller';
import { PaymentsService } from './modules/payments/payments.service';
import { ReservationsController } from './modules/reservations/reservations.controller';
import { ReservationsService } from './modules/reservations/reservations.service';
import { SettingsController } from './modules/settings/settings.controller';
import { SettingsService } from './modules/settings/settings.service';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { JwtStrategy } from './modules/auth/jwt.strategy';
import { RolesGuard } from './modules/auth/roles.guard';
import { AdminController } from './modules/admin/admin.controller';
import { AdminService } from './modules/admin/admin.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'cafex_development_jwt_secret_min_32_chars_long_key_change_in_prod',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    HealthController,
    CatalogController,
    OrdersController,
    PaymentsController,
    ReservationsController,
    SettingsController,
    AuthController,
    AdminController,
  ],
  providers: [
    PrismaService,
    CatalogService,
    OrdersService,
    PaymentsService,
    ReservationsService,
    SettingsService,
    AuthService,
    JwtStrategy,
    RolesGuard,
    AdminService,
  ],
})
export class AppModule {}
