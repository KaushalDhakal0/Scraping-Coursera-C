import { Controller, Get, Query, Param ,Put, Res, Req} from '@nestjs/common';
import { ScrapService } from './scrap.service';
import * as fs from 'fs';
import * as csv from 'csv-parser';
@Controller('/courses')
export class ScrapController {
  constructor(private scrapService: ScrapService) {}

  @Get()
  findAll(@Query() query: { category: string }, @Res() res): any {
    try {
      this.scrapService.getDataViaPuppeteer(query.category);
      res.send(`
    <html>
      <body>
        <h1>Scraping Completed.....</h1>
          <a href="localhost:3000/courses/5",'_blank')">Download Csv</a>
      </body>
    </html>
    `);
    } catch (error) {
      res.send(`
    <html>
      <body>
        <h1>Error While Scraping.</h1>
      </body>
    </html>
    `);
    }
    
  }
  @Get(':id')
  update(@Param('id') id: string , @Res() res, @Req() req) {
    try {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="data2023-01-02T16:02:20.375Z.csv"',
    );

    fs.createReadStream('csvFile/data2023-01-02T16:02:20.375Z.csv')
      .pipe(csv())
      .on('data', (row) => {
        res.write(Object.values(row).join(',') + '\n');
      })
      .on('end', () => {
        res.end();
      });
  } catch (error) {
    res.status(500).send(error.message);
  }
  }
}

