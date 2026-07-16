const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    await page.goto('http://localhost:3000/');
    await page.waitForSelector('button');
    const editButtons = await page.$$('button');
    console.log('Found ' + editButtons.length + ' buttons');
    for (const btn of editButtons) {
        const html = await page.evaluate(el => el.innerHTML, btn);
        if (true) {
            console.log('Clicking an edit button...');
            await btn.click();
            await new Promise(r => setTimeout(r, 500));
        }
    }
    await browser.close();
})();
