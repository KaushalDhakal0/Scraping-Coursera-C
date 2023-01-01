import { Injectable } from '@nestjs/common';
const fs = require('fs');
import * as puppeteer from 'puppeteer';
let csvData;
@Injectable()
export class ScrapService {
  async getDataViaPuppeteer(category: string = '') {
    let arr = [];
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
      //looping over each page and extracting data.
      (async ()=>{
        let finalResult = [];
        for (let i = 0; i <= totalPages; i++) {
          console.log("Breaks on which loop==>",i);
          let dataEachPage = [];
          if(i == totalPages){
            dataEachPage = await this.extractPageData(page);
            finalResult = finalResult?.concat(dataEachPage);
            return;
          }else{
            dataEachPage = await this.extractPageData(page);
            // console.log("Data=======>",dataEachPage);
            finalResult = finalResult?.concat(dataEachPage);
            await page.goto(`https://www.coursera.org/search?query=${category}&page=${i + 1}$&index=prod_all_launched_products_term_optimization`);
            // await page.click("button.label-text.box.arrow[aria-label='Next Page']");
            // await this.handleNext(page);
          }

        }
        await this.convertToCsv(finalResult);
        
      })(); 
      // console.log("All Datata====>",arr);
      // await this.convertToCsv(arr);

    } catch (error) {
      console.log('Error occured===>', error);
    }
    console.log("Final Array result ===>",arr);
  }
  async handleNext(page){
    const select:string ="button.label-text.box.arrow[aria-label='Next Page']";
    await page.waitForSelector(select);
    // const next = await page.evaluate(async (select:string)=>{
      // const nextPage = document.querySelectorAll(select)[1] as HTMLElement | null;  
      // nextPage.click();
      await page.click(select);
      // return "";
    // },select);
  }
  async convertToCsv(arr){
    const keys = Object.keys(arr[0]);
    // Create an array of strings that represents the CSV rows
    const csvRows = arr.map(item => {
    // Create an array of values for the current object
      const values = keys.map(key => item[key]);
    // Join the values with a comma
      return values.join(",");
    });
    csvRows.unshift(keys.join(","));
    const csvString = csvRows.join("\n");
    // Write the CSV string to a file
    fs.writeFileSync("data.csv", csvString);
  }
  async extractPageData(page:any){
    const str:string = '.cds-71.css-0.cds-73.cds-grid-item.cds-118.cds-126.cds-138';
    await page.waitForSelector(str);
    const pageData = await page.evaluate((str:string)=>{
      let coursesLists: {
        provider: string;
        title: string;
        tags: string;
        rating: string;
        reviews: string;
      }[] = [];
        const data = document
                      .querySelectorAll(str)
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
                          '.css-1pa69gt div a div .css-ilhc4l'
                        );
                        const temp2 = requiredSquare.querySelector('div div');

                        const top = temp2.querySelector(
                          '.cds-71.css-1xdhyk6.cds-73.cds-grid-item span'
                        )?.textContent || "";
                        const title = temp2.querySelector('h2')?.textContent || "";
                        const tags1 = temp2.querySelector("div p")?.innerHTML || "";
                        const rating1 = requiredSquare.querySelector("div .css-pn23ng .css-zl0kzj")?.textContent || "";
                        const reviews1 = requiredSquare.querySelector("div .css-pn23ng .css-14d8ngk")?.textContent || "";                                                                                                                      
                        temp.provider = top || "";
                        temp.title = title || "";
                        temp.tags = tags1.slice(tags1.indexOf("</span>")).slice(7).split(",").join("&") || "";
                        temp.rating = rating1 || "";
                        temp.reviews = reviews1 || "";
                        coursesLists.push(temp); 
                      });
      return coursesLists;
    },str);
    // console.log("============>Strrr",pageData);
    return pageData;
  }
  async getPageLimit(page){
    const selector = ".pagination-controls-container > button";
    await page.waitForSelector(selector);
    const dta = await page.evaluate((selector)=>{
      const limit = document.querySelectorAll(selector);
      const req = limit[limit.length - 2];
      const totalPages = req.querySelector("span").textContent;
      return totalPages;
    },selector);
    return dta;
  }
}

