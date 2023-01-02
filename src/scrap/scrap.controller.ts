import { Controller, Get, Query, Param ,Put} from '@nestjs/common';
import { ScrapService } from './scrap.service';
@Controller('/courses')
export class ScrapController {
  constructor(private scrapService: ScrapService) {}

  @Get()
  findAll(@Query() query: { category: string }): any {
    return this.scrapService.getDataViaPuppeteer(query.category);
  }
  @Put(':id')
  update(@Param('id') id: string) {
    return `This action updates a user with ID: ${id}`;
  }
}

