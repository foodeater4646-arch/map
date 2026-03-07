const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('ERR:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('PAGE_ERR:', error.message);
    });

    await page.goto('http://localhost:5174/');

    // Try to log in
    try {
        await page.type('input[type="email"]', 'test@test.com');
        await page.type('input[type="password"]', 'password123');
        await page.click('button.auth-submit');
        await new Promise(r => setTimeout(r, 6000));
    } catch (e) {
        console.log("Could not login:", e.message);
    }

    await browser.close();
})();
