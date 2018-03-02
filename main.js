const Apify = require('apify');
const typeCheck = require('type-check').typeCheck;
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const uniq = require('lodash').uniq

// Definition of the input
const INPUT_TYPE = `{
    source: String,
    query: String,
    dictionary: Maybe String,
}`;

Apify.main(async () => {
    // Fetch the input and check it has a valid format
    // You don't need to check the input, but it's a good practice.
    const input = await Apify.getValue('INPUT');
    if (!typeCheck(INPUT_TYPE, input)) {
        console.log('Expected input:');
        console.log(INPUT_TYPE);
        console.log('Received input:');
        console.dir(input);
        throw new Error('Received invalid input');
    }

    // Environment variables
    const launchPuppeteer = process.env.NODE_ENV === 'development' ? puppeteer.launch : Apify.launchPuppeteer;

    // Navigate to page
    const uri = `http://conjugator.reverso.net/conjugation-${input.source}-verb-${input.query}.html`
    const browser = await launchPuppeteer();
    const page = await browser.newPage();
    await page.goto(uri);

    let html = await page.content();
    const $ = cheerio.load(html);

    // Get verb conjugation list
    let results = [];

    $('.verbtxt').each((i, elem) => {
        const txt = $(elem).text().trim();
        const splitted = txt.split('/');
        results = results.concat(splitted);
    });

    // Here's the place for your magic...
    console.log(`Input query: ${input.query}`);
    console.log('Result: ', uniq(results));

    // Store the output
    const output = {
        conjugation: uniq(results)
    };
    await Apify.setValue('OUTPUT', output)
});
