import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ScrapService {
  async getDataViaPuppeteer(category: string = '') {
   let pageNo;
    try {
      const URL = `https://www.coursera.org/search?query=${category}&page=${pageNo}`;
      const browser = await puppeteer.launch({
        headless: false,
        dumpio: true,
      });

      const page = await browser.newPage();
      await page.goto(URL, {
        waitUntil: 'networkidle2',
      });
      //   cds-71 css-0 cds-73 cds-grid-item cds-118 cds-126 cds-138
      const selectorStr =
        '.cds-71.css-0.cds-73.cds-grid-item.cds-118.cds-126.cds-138';
      await page.waitForSelector(selectorStr);
      let csvData;
      const result = await page.evaluate(() => {
        function convertToCSV(arr) {
            const array = [Object.keys(arr[0])].concat(arr)
          
            return array.map(it => {
              return Object.values(it).toString()
            }).join('\n')
          };
        const coursesLists: {
          producer: string;
          title: string;
          tags: string;
          rating: string;
          reviews: string;
        }[] = [];
        async function compute() {
            const data = document
          .querySelectorAll(
            '.cds-71.css-0.cds-73.cds-grid-item.cds-118.cds-126.cds-138',
          )
          .forEach((dta) => {
            let temp: {
              producer: string;
              title: string;
              tags: string;
              rating: string;
              reviews: string;
            } = {
              producer: '',
              title: '',
              tags: '',
              rating: '',
              reviews: '',
            };
            const requiredSquare = dta.querySelector(
              '.css-1pa69gt div a div .css-ilhc4l ',
            );
            // console.log("Required Square ==>",requiredSquare);

            const temp2 = requiredSquare.querySelector('div div');
            // console.log(temp2);

            const top = temp2.querySelector(
              '.cds-71.css-1xdhyk6.cds-73.cds-grid-item span'
            )?.textContent || "not patched";
            const title = temp2.querySelector('h2')?.textContent || "Not patched";
            const tags1 = temp2.querySelector("div p")?.innerHTML || "Not patched";
            const rating1 = requiredSquare.querySelector("div .css-pn23ng .css-zl0kzj")?.textContent || "Not patched";
            const reviews1 = requiredSquare.querySelector("div .css-pn23ng .css-14d8ngk")?.textContent || "not patched";
            temp.producer = top || "";
            temp.title = title || "";
            temp.tags = tags1.slice(tags1.indexOf("</span>")).slice(7).split(",").join("&") || "";
            temp.rating = rating1 || "";
            temp.reviews = reviews1 || "";
            coursesLists.push(temp); 
            console.log(temp.tags);
            
             csvData = convertToCSV(coursesLists);
            

          });
        }
            for (let index = 0; index < 50; index++) {
                const nextBtn = document.querySelector('.label-text.box.arrow') as HTMLElement;
                if(nextBtn){
                    nextBtn.click();
                    compute();
                }
            }
            compute();

          var element = document.createElement('a');
          element.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
          element.target = '_blank';
          element.download = 'export.csv';
          element.click();
          
        return coursesLists;
      });
    } catch (error) {
      console.log('Error occured===', error);
    }
  }
}
// function convertToCSV(arr) {
//     const array = [Object.keys(arr[0])].concat(arr)
  
//     return array.map(it => {
//       return Object.values(it).toString()
//     }).join('\n')
//   }
