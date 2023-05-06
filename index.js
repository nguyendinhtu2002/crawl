const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const url = require('url');
const axios = require('axios');
const { Cluster } = require('puppeteer-cluster');

puppeteer.use(StealthPlugin());


const extractMmsiFromUrl = (url) => {
    const regex = /mmsi:(\d+)/;
    const matches = url.match(regex);

    if (matches && matches.length > 1) {
        return matches[1];
    }

    return null;
}
(async () => {
    try {
        const data = fs.readFileSync('filtered_data.json');
        const jsonData = JSON.parse(data);

        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 5,
            puppeteerOptions: {
                headless: true,
            },
        });

        await cluster.task(async ({ page, data: url }) => {
            // Delete all cookies
            const client = await page.target().createCDPSession();
            await client.send('Network.clearBrowserCookies');

            // Disable cache
            await page.setCacheEnabled(false);

            await page.goto(url);
            const currentUrl = page.url();
            const mmsi = extractMmsiFromUrl(currentUrl);
            if (mmsi !== null) {
                console.log(`MMSI for ${url}: ${mmsi}`);
            }
        });

        for (const jsonDataItem of jsonData) {
            const shipId = jsonDataItem.SHIP_ID;
            const url = `https://www.marinetraffic.com/en/ais/details/ships/shipid:${shipId}`;
            await cluster.queue(url);
        }

        await cluster.idle();
        await cluster.close();

    } catch (error) {
        console.log(error)
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