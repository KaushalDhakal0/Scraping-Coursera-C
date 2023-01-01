import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
let csvData;
@Injectable()
export class ScrapService {
  async getDataViaPuppeteer(category: string = '') {
    console.log("here");
   let pageNo =1;
    try {
      const URL = `https://www.coursera.org/search?query=${category}&page=${pageNo}`;
      const browser = await puppeteer.launch({
        headless: false,
        dumpio: true,
      });

      const page = await browser.newPage();
      await page.goto(URL, {
        waitUntil: 'load',
      });
      const selectorStr =
        '.cds-71.css-0.cds-73.cds-grid-item.cds-118.cds-126.cds-138';
      await page.waitForSelector(selectorStr);
      
      const result = await page.evaluate(() => {
        
        function convertToCSV(arr) {
            const array = [Object.keys(arr[0])].concat(arr)
          
            return array.map(it => {
              return Object.values(it).toString()
            }).join('\n')
          };
        const coursesLists: {
          provider: string;
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
              provider: string;
              title: string;
              tags: string;
              rating: string;
              reviews: string;
            } = {
              provider: '',
              title: '',
              tags: '',
              rating: '',
              reviews: '',
            };
            const requiredSquare = dta.querySelector(
              '.css-1pa69gt div a div .css-ilhc4l ',
            );
            const temp2 = requiredSquare.querySelector('div div');

            const top = temp2.querySelector(
              '.cds-71.css-1xdhyk6.cds-73.cds-grid-item span'
            )?.textContent || "not patched";
            const title = temp2.querySelector('h2')?.textContent || "Not patched";
            const tags1 = temp2.querySelector("div p")?.innerHTML || "Not patched";
            const rating1 = requiredSquare.querySelector("div .css-pn23ng .css-zl0kzj")?.textContent || "Not patched";
            const reviews1 = requiredSquare.querySelector("div .css-pn23ng .css-14d8ngk")?.textContent || "not patched";
            temp.provider = top || "";
            temp.title = title || "";
            temp.tags = tags1.slice(tags1.indexOf("</span>")).slice(7).split(",").join("&") || "";
            temp.rating = rating1 || "";
            temp.reviews = reviews1 || "";
            console.log("Temps ==>",temp);
            
            coursesLists.push(temp); 
            console.log(temp.tags);
            csvData = convertToCSV(coursesLists);
            

          });
        }
            for (let index = 0; index < 5; index++) {
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
      console.log("Result =====>",result);
    } catch (error) {
      console.log('Error occured===', error);
    }
  }
}
