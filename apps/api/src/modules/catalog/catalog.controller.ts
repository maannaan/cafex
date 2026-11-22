import { Controller, Get, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('menu')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async getMenu() {
    return this.catalogService.getMenu();
  }

  @Get('products/:slug')
  async getProduct(@Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }
}
