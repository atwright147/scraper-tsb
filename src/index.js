const puppeteer = require('puppeteer');
const rimraf = require('rimraf');
const config = require('../config/prod.json');

// https://dev.to/lexmartinez/build-a-car-price-scraper-optimizer-using-puppeteer-38p

(async () => {
    rimraf('./screenshots/**/*', () => {});

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://internetbanking.tsb.co.uk/personal/logon/login/');

    // enter username and password
    const userIdField = 'input[name="userId"]';
    await page.waitForSelector(userIdField);
    await page.waitFor(100);
        await page.type(userIdField, config.username);
        await page.type('input[name="password"]', config.password);
        await page.click('button.login[type="submit"]');

    // enter memorable information
    await page.waitForSelector('form[name="memorableInformationForm"]');
    await page.waitFor(1000);

        const selectX = await page.$('select#charXPos');
        let selectXlabel = await page.evaluateHandle(el => el.previousSibling.textContent, selectX);
        selectXlabel = Number(selectXlabel._remoteObject.value.replace(/Character |:/ig, ''));
        
        const selectY = await page.$('select#charYPos');
        let selectYlabel = await page.evaluateHandle(el => el.previousSibling.textContent, selectY);
        selectYlabel = Number(selectYlabel._remoteObject.value.replace(/Character |:/ig, ''));
        
        const selectZ = await page.$('select#charZPos');
        let selectZlabel = await page.evaluateHandle(el => el.previousSibling.textContent, selectZ);
        selectZlabel = Number(selectZlabel._remoteObject.value.replace(/Character |:/ig, ''));

        await page.select('select#charXPos', config.secret[selectXlabel-1]);
        await page.select('select#charYPos', config.secret[selectYlabel-1]);
        await page.select('select#charZPos', config.secret[selectZlabel-1]);

        await page.waitFor(100)
        await page.click('button[type="submit"]');

    // click on link to your account
    await page.waitForSelector('a[title="View the latest transactions on your Silver Account"]');
        await page.click('a[title="View the latest transactions on your Silver Account"]');




    await page.waitFor(100000)
    await browser.close();
})();


// await page.focus('#lst-ib')
// page.type('China')
