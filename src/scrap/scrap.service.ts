import { Injectable } from '@nestjs/common';
const fs = require('fs');
import * as puppeteer from 'puppeteer';
let csvData;
@Injectable()
export class ScrapService {

  async getDataViaPuppeteer(category: string = '') {
    console.log("Start");
    
    let finalResult = [];
  //  let pageNo =1;
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
         totalPages = totalPages - 1;
         await page.waitForSelector("div .css-pn23ng .css-zl0kzj");
         const datatemp = await this.extractPageData(page);
         finalResult = [...finalResult, ...datatemp];
         await this.handleNext(page);
         console.log("Final Result ===>",finalResult);
         const nextbtn = await page.$(".label-text.box.arrow.arrow-disabled");
        if (nextbtn) {
        // If there is  "Next" button disabled, we have reached the last page
          console.log("Loop Breaking Here");
          
          break;
        }
      }
      await browser.close();
      console.log("All Data ==>",finalResult);
      
      
      // (async ()=>{
      //   // let finalResult = [];
      //   for (let i = 0; i <= totalPages; i++) {
      //     console.log("Breaks on which loop==>",i);
      //     let dataEachPage = [];
      //     if(i == totalPages){
      //       dataEachPage = await this.extractPageData(page);
      //       finalResult = [...finalResult, ...dataEachPage];
      //     }else{
      //       dataEachPage = await this.extractPageData(page);
      //       finalResult = [...finalResult, ...dataEachPage];
      //       console.log(finalResult);

      //       await page.waitForSelector("button.label-text.box.arrow[aria-label='Next Page']");
      //       // await page.waitForSelector(".cds-71.css-0.cds-73.cds-grid-item.cds-118.cds-126.cds-138");
            
      //       // setTimeout(async()=>{
      //         await this.handleNext(page);
      //       // },5000);
      //     }

      //   }
      //   await this.convertToCsv(finalResult);
        
      // })(); 
      // console.log("All Datata====>",arr);
      // await this.convertToCsv(arr);
      // console.log("Final datatatata==>",data);
      

    } catch (error) {
      console.log('Error occured===>', error);
    }
    // console.log("++++>>>><<<<<>>>>>>",finalResult);
    
    
  }
  async handleNext(page){
    const select:string ="button.label-text.box.arrow[aria-label='Next Page']";
    await page.waitForSelector(select);
    // const next = await page.evaluate(async (select:string)=>{
      // const nextPage = document.querySelectorAll(select)[1] as HTMLElement | null;  
      // nextPage.click();
      // await page.waitForNavigation();
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
    await page?.waitForSelector(str);
    
    
    const pageData = await page?.evaluate((str:string)=>{
      console.log("I'm here");
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

