const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const url = require("url");
const axios = require("axios");
const { request } = require("http");

puppeteer.use(StealthPlugin());

const extractMmsiFromUrl = (url) => {
  const regex = /mmsi:(\d+)/;
  const matches = url.match(regex);

  if (matches && matches.length > 1) {
    return matches[1];
  }

  return null;
};
// // const data = require("./data.json")
(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
    });
    const page = await browser.newPage();

    await page.goto("https://www.marinetraffic.com/users/login");

    await page.waitForSelector(".css-47sehv");

    // Click on the button
    await page.click(".css-47sehv");

    await page.waitForSelector("#email");
    await page.type("#email", "andusong2488@gmail.com");

    await page.waitForSelector("#password");
    await page.type("#password", "huongKhenh123");

    await page.waitForSelector("#login_form_submit");
    await page.click("#login_form_submit");
    page.on("request", async (request) => {
      const url = request.url();
      if (
        url.includes("https://www.marinetraffic.com/getData/get_data_json_4")
      ) {
        console.log(url);
        console.log(JSON.stringify(request.headers()));
        const headers = request.headers();
        const vesselImage = headers["vessel-image"];
        const script = `fetch("${url}", {
          "headers": {
            "Vessel-Image": "${vesselImage}",
          }
        })
        .then(res => res.json())
        .then(data => {
         console.log(data)
         return data;
        });`;
        const respone = await page.evaluate(script);
        console.log(respone);
        page.off("request");
      }
    });

    await browser.close();
  } catch (error) {
    console.log(error);
  }
})();

// Số mini giây ban đầu

// Hàm tính toán số mini giây sau mỗi 2 phút
// function calculateMs() {
//   ms += 2 * 60 * 1000;  // Chuyển đổi 2 phút sang mini giây và cộng vào số mini giây hiện tại
//   ms += 1683333693;     // Cộng thêm 1683333693 mini giây
//   return ms;
// }

// (async () => {
//     const browser = await puppeteer.launch({});
//     const page = await browser.newPage();

//     // Enable request interception
//     await page.setRequestInterception(true);

//     await page.goto('https://www.marinetraffic.com/en/ais/home/centerx:115.916/centery:20.354/zoom:10');

//     // Wait for all requests to finish
//     await page.waitForRequest(() => true);

//     await browser.close();
// })();
// In ra số mini giây sau mỗi 2 phút
// console.log(calculateMs());

// const data = fs.readFileSync('data.json');
// const json = JSON.parse(data);

// // Tạo một mảng mới chỉ chứa các thuộc tính cần thiết
// const filteredData = json.data.rows.map(({ SHIP_ID, LAT, LON }) => ({ SHIP_ID, LAT, LON }));

// // Ghi dữ liệu vào tệp JSON mới
// fs.writeFileSync('filtered_data.json', JSON.stringify(filteredData));
