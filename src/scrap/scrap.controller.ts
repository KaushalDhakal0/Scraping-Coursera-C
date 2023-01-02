import { Controller, Get, Query, Param ,Put, Res} from '@nestjs/common';
import { ScrapService } from './scrap.service';
@Controller('/courses')
export class ScrapController {
  constructor(private scrapService: ScrapService) {}

  @Get()
  findAll(@Query() query: { category: string }, @Res() res): any {
    try {
      this.scrapService.getDataViaPuppeteer(query.category);
    } catch (error) {
      res.send(`
    <html>
      <body>
        <h1>Error While Scraping.</h1>
      </body>
    </html>
    `);
    }
    res.send(`
    <html>
      <body>
        <h1>Scraping Completed.....</h1>
          <a href="localhost:3000/courses/5",'_blank')" >Download Csv</a>
      </body>
    </html>
    `);
  }
  @Get(':id')
  update(@Param('id') id: string , @Res() res) {
    // const link =  this.scrapService.createDownloadLink(id);
    res.send(`
    <html>
      <body>
        <h1>Hello, World!</h1>
      </body>
    </html>
    `);
  }
}

