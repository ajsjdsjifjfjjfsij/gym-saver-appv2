const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function checkPrices() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    console.log("Checking PureGym Lichfield...");
    try {
        await page.goto("https://www.puregym.com/join/lichfield/monthly/", { waitUntil: 'networkidle2', timeout: 30000 });
        const text = await page.evaluate(() => document.body.innerText);
        const priceMatches = text.match(/£\d+\.\d{2}/g);
        console.log("PureGym Prices found on page:");
        if (priceMatches) {
            console.log([...new Set(priceMatches)].slice(0, 5));
        } else {
            console.log("No explicit prices found via simple regex.");
        }
    } catch (e) {
        console.error("PureGym scrape failed:", e.message);
    }

    console.log("\nChecking Jetts Gym Lichfield...");
    try {
        await page.goto("https://www.jetts.co.uk/gyms/jetts-lichfield/", { waitUntil: 'networkidle2', timeout: 30000 });
        const text = await page.evaluate(() => document.body.innerText);
        const priceMatches = text.match(/£\d+\.\d{2}/g);
        console.log("Jetts Gym Prices found on page:");
        if (priceMatches) {
            console.log([...new Set(priceMatches)].slice(0, 5));
        } else {
            console.log("No explicit prices found via simple regex.");
            // Try looking for numbers near 'month' or 'join'
            const contextMatches = text.match(/.{0,20}£\d+.{0,20}/g);
            if (contextMatches) console.log(contextMatches.slice(0, 5));
        }
    } catch (e) {
        console.error("Jetts scrape failed:", e.message);
    }

    await browser.close();
}

checkPrices().catch(console.error);
