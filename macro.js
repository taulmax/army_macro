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

  // 실시간검색어에서 가져온 URL을 통해 뉴스 크롤링
  for (let i = 0; i < silgums.length; i++) {
    await page.goto(silgums[i].url);
    const newsURL = await page.$eval("#sp_nws1 > div > a", (data) => data.href);

    // 뉴스 링크로 이동
    await page.goto(newsURL);
    // 타임아웃 30초 이슈 해결해야함
    // 아싸리 컴터가 버티면 한번에 10개 페이지 다 띄우는것도 나쁘진 않을듯
  }

  await browser.close();
};
