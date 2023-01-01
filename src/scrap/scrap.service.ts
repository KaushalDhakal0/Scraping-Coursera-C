import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
let csvData;
@Injectable()
export class ScrapService {
  async getDataViaPuppeteer(category: string = '') {
    // this.sayHi();
    console.log("here");
   let pageNo =1;
    try {
      const URL = `https://www.coursera.org/search?query=${category}`;
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
      const totalPages = await this.getPageLimit(page);
      console.log("total Number of required loops ===>",totalPages);
      
      const course = await this.extractPageData(page);
      // console.log("COURSES===>",course);
      
      await this.handleNext(page);
      // console.log("Result =====>",result);
    } catch (error) {
      console.log('Error occured===', error);
    }
  }
  async handleNext(page){
    await page.waitForSelector(".label-text.box.arrow");
    const next = await page.evaluate(()=>{
      const nextPage = document.querySelectorAll(".label-text.box.arrow")[1] as HTMLElement | null;  
      nextPage.click();
    })
  }
  async convertToCsv(arr){
    const array = [Object.keys(arr[0])].concat(arr)
          
            return array.map(it => {
              return Object.values(it).toString()
            }).join('\n');
  }
  async extractPageData(page){
    const coursesLists: {
      provider: string;
      title: string;
      tags: string;
      rating: string;
      reviews: string;
    }[] = [];
    const pageData = await page.evaluate(()=>{
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
        // console.log("Temps ==>",temp);
        coursesLists.push(temp); 
        // console.log(temp.tags);
        // csvData = this.convertToCSV(coursesLists);
      });
    }
    compute();
    });
    return coursesLists;
  }
  async getPageLimit(page){
    const selector = ".pagination-controls-container > button";
    // let totalPages = "";
    await page.waitForSelector(selector);
    const dta = await page.evaluate((selector)=>{
      const limit = document.querySelectorAll(selector);
      const req = limit[limit.length - 2];
      const totalPages = req.querySelector("span").textContent;
      // console.log("Total page below====>",totalPages);
      return totalPages;
      
    },selector);
    return dta;
  }
}

