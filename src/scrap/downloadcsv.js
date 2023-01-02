import * as fs from 'fs';
import * as csv from 'csv-parser';
import { Request, Response } from '@nestjs/common';

export function downloadCSV(req: Request, res: Response) {
  try {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="my-csv-file.csv"',
    );

    fs.createReadStream('path/to/my-csv-file.csv')
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
