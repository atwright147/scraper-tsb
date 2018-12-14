import puppeteer from 'puppeteer';
import rimraf from 'rimraf';
import fs from 'fs';

import config from '../config/prod.json';
import processor from './utils/processor';

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.error('unhandledRejection', error.message);
});

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

    const statementPages = 10;
    let iteration = 0;
    let transactions;

    // get statement data
    do {
        // await page.waitForSelector('table tbody tr');
        await page.waitFor(100);
            transactions = await page.evaluate(() => {
                const statement = [];
                const tableBodyRows = document.querySelectorAll('table tbody tr');
                tableBodyRows.forEach((row) => {
                    const rowData = Array.from(row.querySelectorAll('td'));
                    const statementRow = {};

                    // Date  Description  Type[?]  In (£)  Out (£)  Balance (£)
                    statementRow['date'] = rowData[0].innerText;
                    statementRow['description'] = rowData[1].innerText;
                    statementRow['type'] = rowData[2].innerText;
                    statementRow['in'] = rowData[3].innerText;
                    statementRow['out'] = rowData[4].innerText;
                    statementRow['balance'] = rowData[5].innerText;

                    statement.push(statementRow);
                });

                return statement;
            });

        await page.waitFor(100);
        await page.click('a[label="Page navigation"][action="previous"]');
        await page.waitForRequest('https://internetbanking.tsb.co.uk/api-assured/statementswebadapter-v1/searchTransactions');

        iteration += 1;
    } while (iteration < statementPages);

    // await page.waitFor(100000)
    await browser.close();

    const processedTransactions = processor(transactions);

    fs.writeFileSync('./scraped-data/statement.json', JSON.stringify(processedTransactions, ' ', 4));
})();

// loading spinner (ng-if): #invokerLoader-statementComponentsId.loading-spinner
// statement xhr url: https://internetbanking.tsb.co.uk/api-assured/statementswebadapter-v1/searchTransactions
