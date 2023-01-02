import { Controller, Get, Query } from '@nestjs/common';
import { ScrapService } from './scrap.service';
@Controller('/courses')
export class ScrapController {
  constructor(private scrapService: ScrapService) {}

  @Get()
  findAll(@Query() query: { category: string }): any {
    // console.log(query);
    // return "HELLO Course";
    return this.scrapService.getDataViaPuppeteer(query.category);
  }
}
