import puppeteer from "puppeteer";
import { sleep } from "./function.js";

export const getSilgum = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // 실시간 검색어 홈페이지
  await page.goto("https://www.signal.bz/");

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // 실시간 검색어 정보 가져오기
  let silgums = [];
  const silgumAnchors = await page.$$(
    "div.realtime-rank > div.rank-column > div > a"
  );
  for (let i = 0; i < silgumAnchors.length; i++) {
    let temp = {};
    temp.index = await silgumAnchors[i].$eval(
      "span.rank-num",
      (data) => data.textContent
    );
    temp.silgum = await silgumAnchors[i].$eval(
      "span.rank-text",
      (data) => data.textContent
    );
    temp.url = await silgumAnchors[i].evaluate((data) => data.href);
    silgums.push(temp);
  }

  await browser.close();
};
