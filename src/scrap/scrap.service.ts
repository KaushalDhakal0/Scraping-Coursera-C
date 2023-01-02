import { Injectable } from '@nestjs/common';
const fs = require('fs');
import * as puppeteer from 'puppeteer';
let csvData:string;
@Injectable()
export class ScrapService {

  async getDataViaPuppeteer(category: string = '') {
    let finalResult: {
      provider: string,
      title: string,
      tags: string,
      rating: string,
      reviews: string,
    }[] = [];;
    try {
      const URL = `https://www.coursera.org/search?query=${category}`;
      const browser = await puppeteer.launch({
        headless: false,
        dumpio: true,
        executablePath:"/usr/bin/brave-browser",
        userDataDir:"~/.config/BraveSoftware/Brave-Browser/"
      });
      const page = await browser.newPage();
      await page.goto(URL, {
        waitUntil: 'load',
      });
      const selectorStr =
        '.cds-71.css-0.cds-73.cds-grid-item.cds-118.cds-126.cds-138';
        
      await page.waitForSelector(selectorStr);
      let totalPages = await this.getPageLimit(page); 
      while(true){
        //  await page.goto(`https://www.coursera.org/search?query=${category}&page=${totalPages}`);
         await page.waitForSelector("div .css-pn23ng .css-zl0kzj");
         //extracting data from each page.
         const datatemp = await this.extractPageData(page);
         finalResult = [...finalResult, ...datatemp];
         //clicks the next button
         await this.handleNext(page);
         const nextbtn = await page.$(".label-text.box.arrow.arrow-disabled");
        if (nextbtn) {
        // If there is  "Next" button disabled, we have reached the last page
          console.log("Loop Breaking Here");
          
          break;
        }
      }
      await browser.close();
      await this.convertToCsv(finalResult);
      

    } catch (error) {
      console.log('Error occured===>', error);
    }
    console.log("All Data ==== ",finalResult);
  }
  async handleNext(page:any){
    const select:string ="button.label-text.box.arrow[aria-label='Next Page']";
    await page.waitForSelector(select);
    await page.click(select);
  }
  async convertToCsv(arr:any){
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
    //create unique file name. UUID will be a better option
    const date = new Date().toISOString();
    fs.writeFileSync(`csvFile/data${date}.csv`, csvString);
  }
  async extractPageData(page:any){
    const str:string = '.cds-71.css-0.cds-73.cds-grid-item.cds-118.cds-126.cds-138';
    await page?.waitForSelector(str);
    const pageData = await page?.evaluate((str:string)=>{
      let coursesLists: {
        provider: string;
        title: string;
        tags: string;
        rating: string;
        reviews: string;
      }[] = [];
        const data = document
                      ?.querySelectorAll(str)
                      ?.forEach((dta) => {
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
                        const requiredSquare = dta?.querySelector(
                          '.css-1pa69gt div a div .css-ilhc4l'
                        );
                        const temp2 = requiredSquare?.querySelector('div div');

                        const top = temp2.querySelector(
                          '.cds-71.css-1xdhyk6.cds-73.cds-grid-item span'
                        )?.textContent || "";
                        const title = temp2.querySelector('h2')?.textContent || "";
                        const tags1 = temp2.querySelector("div p")?.innerHTML || "";
                        const rating1 = requiredSquare.querySelector("div .css-pn23ng .css-zl0kzj")?.textContent || "";
                        const reviews1 = requiredSquare.querySelector("div .css-pn23ng .css-14d8ngk")?.textContent || "";                                                                                                                      
                        temp.provider = top || "Unknown";
                        temp.title = title || "Title";
                        temp.tags = tags1.slice(tags1.indexOf("</span>")).slice(7).split(",").join("&") || "";
                        temp.rating = rating1 || "3";
                        temp.reviews = reviews1 || "20";
                        coursesLists.push(temp); 
                      });
      return coursesLists;
    },str);
    // console.log("============>Strrr",pageData);
    return pageData;
  }
  async getPageLimit(page:any){
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

