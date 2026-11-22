import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicSettings() {
    const settings = await this.prisma.businessSettings.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings) {
      return {
        cafeName: 'Cafex Roastery',
        tagline: 'Artisan Coffee & Warm Gatherings',
        address: '100 Artisan Way',
        phone: '+91 98765 43210',
        email: 'hello@cafexroastery.com',
        currency: 'INR',
        currencySymbol: '₹',
        timezone: 'Asia/Kolkata',
        openingHours: {},
        taxPercentage: 5,
        deliveryEnabled: false,
      };
    }

    return {
      cafeName: settings.cafeName,
      tagline: settings.tagline,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      timezone: settings.timezone,
      openingHours: settings.openingHoursJson,
      taxPercentage: Number(settings.taxPercentage),
      deliveryEnabled: settings.deliveryEnabled,
    };
  }
}

