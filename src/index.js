import puppeteer from 'puppeteer';
import rimraf from 'rimraf';
import path from 'path';

import config from '../config/prod.json';

const pause = 1000;
const headless = false;

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.error('unhandledRejection', error);
});

// https://dev.to/lexmartinez/build-a-car-price-scraper-optimizer-using-puppeteer-38p

/* eslint-disable no-console */
(async () => {
    if (headless) {
        console.info('Running in headless mode');
    } else {
        console.info('Running in GUI mode');
    }

    rimraf('./screenshots/**/*', () => {});
    rimraf('./statements/**/*', () => {});

    const browser = await puppeteer.launch({ headless: headless });
    const page = await browser.newPage();
    await page.goto('http://internetbanking.tsb.co.uk/personal/logon/login/');

    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path.resolve(__dirname, '..', 'statements'),
    });

    // enter username and password
    console.info('Entering username and password');
    await page.waitForSelector('input[name="userId"]');
    await page.waitFor(pause);
        await page.type('input[name="userId"]', config.username);
        await page.type('input[name="password"]', config.password);
        await page.click('button.login[type="submit"]');

    // enter memorable information
    console.info('Entering memorable information');
    await page.waitForSelector('form[name="memorableInformationForm"]');
    await page.waitFor(pause);

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

        await page.waitFor(pause);
        await page.click('button[type="submit"]');

    // click on link to your account
    console.info('Clicking view statement');
    await page.waitForSelector('a[title="View the latest transactions on your Silver Account"]');
        await page.waitFor(pause)
        await page.click('a[title="View the latest transactions on your Silver Account"]');

    console.info('Opening export modal');
    await page.waitForSelector('a[label="Open Export Statement Popover"]');
        await page.waitFor(pause);
        await page.click('a[label="Open Export Statement Popover"]');

    console.info('Select date range as export type');
    await page.waitForSelector('input[type="radio"]#dateRange');
        await page.waitFor(pause);
        await page.click('input[type="radio"]#dateRange');

    console.info('Entering date range values');
    await page.waitForXPath('(//select[@id="selectYear"])[1]');
        await page.waitFor(pause);
        await page.evaluate(() => {
            // from
            document.evaluate('(//select[@id="selectYear"])[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.value = '2017';
            document.evaluate('(//select[@id="selectMonth"])[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.value = '2';
            document.evaluate('(//select[@id="selectDay"])[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.value = '1';
            // to
            document.evaluate('(//select[@id="selectYear"])[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.value = '2017';
            document.evaluate('(//select[@id="selectMonth"])[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.value = '2';
            document.evaluate('(//select[@id="selectDay"])[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.value = '28';

            // from
            document.evaluate('(//select[@id="selectYear"])[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                .dispatchEvent(new Event('change', { 'bubbles': true }));
            document.evaluate('(//select[@id="selectMonth"])[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                .dispatchEvent(new Event('change', { 'bubbles': true }));
            document.evaluate('(//select[@id="selectDay"])[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                .dispatchEvent(new Event('change', { 'bubbles': true }));
            // to
            document.evaluate('(//select[@id="selectYear"])[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                .dispatchEvent(new Event('change', { 'bubbles': true }));
            document.evaluate('(//select[@id="selectMonth"])[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                .dispatchEvent(new Event('change', { 'bubbles': true }));
            document.evaluate('(//select[@id="selectDay"])[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                .dispatchEvent(new Event('change', { 'bubbles': true }));
        });

    console.info('Clicking the export button');
    await page.click('button#exportPageBtn');

    if (!headless) {
        console.info('Long pause for debugging');
        await page.waitFor(100000)
    }

    console.info('Closing browser');
    await browser.close();
})();
/* eslint-enable no-console */

// loading spinner (ng-if): #invokerLoader-statementComponentsId.loading-spinner
// statement xhr url: https://internetbanking.tsb.co.uk/api-assured/statementswebadapter-v1/searchTransactions
