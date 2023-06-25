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
    // temp.url = await silgumAnchors[i].evaluate((data) => data.href);
    silgums.push(temp);
  }

  // 실시간검색어에서 정보를 통해 뉴스 크롤링
  for (let i = 0; i < silgums.length; i++) {
    await page.goto("https://www.bigkinds.or.kr/v2/news/search.do");
    await page.click("#collapse-step-1");
    await sleep(1000);

    await page.waitForSelector("#total-search-key");
    await page.type("#total-search-key", silgums[i].silgum);
    await page.keyboard.press("Enter");
    await sleep(3000);

    // 검색 결과가 0이면 패스
    await page.waitForSelector(
      "#news-results-tab > div.data-result-hd.pc-only.paging-v2-wrp > h3 > span.total-news-cnt"
    );
    const newsCount = await page.$eval(
      "#news-results-tab > div.data-result-hd.pc-only.paging-v2-wrp > h3 > span.total-news-cnt",
      (data) => data.textContent
    );
    if (parseInt(newsCount) == 0) {
      continue;
    }

    // 뉴스 정보 크롤링
    await page.waitForSelector(
      "#news-results > div:nth-child(1) > div > div.cont > a > div > strong > span"
    );
    await page.click(
      "#news-results > div:nth-child(1) > div > div.cont > a > div > strong > span"
    );

    await sleep(3000);

    await page.waitForSelector(
      "#news-detail-modal > div > div > div.modal-body > div > div.news-view-head > h1"
    );
    silgums[i].title = await page.$eval(
      "#news-detail-modal > div > div > div.modal-body > div > div.news-view-head > h1",
      (data) => data.textContent
    );

    await page.waitForSelector(
      "#news-detail-modal > div > div > div.modal-body > div > div.news-view-body"
    );
    silgums[i].contents = await page.$eval(
      "#news-detail-modal > div > div > div.modal-body > div > div.news-view-body",
      (data) =>
        data.textContent
          .replaceAll("\n", "")
          .replaceAll("\t", "")
          .replaceAll("  ", "")
    );
  }

  console.log(silgums);

  // 더캠프 로그인
  await page.goto("https://www.thecamp.or.kr/login/viewLogin.do");

  await browser.close();
};
