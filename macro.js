import puppeteer from "puppeteer";
import { sleep } from "./function.js";

export const getSilgum = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // 실시간 검색어 홈페이지
  await page.goto("https://www.signal.bz/");

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
      (data) => {
        const replacedContent = data.textContent
          .replaceAll("\n", "")
          .replaceAll("\t", "")
          .replaceAll("  ", "");

        if (replacedContent.length > 1499) {
          return replacedContent.substr(0, 1499);
        } else {
          return replacedContent;
        }
      }
    );
  }

  console.log(silgums);

  // 더캠프 로그인
  await page.goto("https://www.thecamp.or.kr/login/viewLogin.do");

  await page.waitForSelector("#userId");
  await page.type("#userId", process.env.ID);
  await page.waitForSelector("#userPwd");
  await page.type("#userPwd", process.env.PW);
  await page.click("#emailLoginBtn");
  await sleep(3000);

  // 위문편지 작성하러 가기
  for (let i = 0; i < silgums.length; i++) {
    if (!silgums[i].title) {
      continue;
    }

    await page.goto(
      "https://www.thecamp.or.kr/eduUnitCafe/viewEduUnitCafeMain.do"
    );
    await sleep(1000);
    await page.click(
      "#divSlide1 > div.swiper-wrapper > div.swiper-slide.swiper-slide-active.swiper-slide-duplicate-next.swiper-slide-duplicate-prev > div > div.btn-wrap > a.btn-green"
    );
    await sleep(1000);
    await page.click(
      "body > div.container > div.container-wrap > div:nth-child(2) > div.btn-a-wrap.text-center.mt50 > button"
    );
    await sleep(1000);

    // 위문편지 작성
    await page.type("#sympathyLetterSubject", silgums[i].title);
    await page.keyboard.press("Tab");
    await page.keyboard.type(silgums[i].contents);
    await sleep(1000);
    await page.click(
      "body > div.container > div.container-wrap > section > div.btn-b-area > a:nth-child(3)"
    );
    await sleep(3000);
  }

  console.log("전송 완료!");
  await browser.close();
};
