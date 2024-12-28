const fs = require('fs'); // Importing the file system module to svae the scraped data into a JSON file. (product_links.json)
const puppeteer = require('puppeteer'); // For enabling the web scraping.

// Function to handle infinite scrolling on websites with dynamic content
const scrollPage = async (page) => {
    let previousHeight = await page.evaluate(() => document.body.scrollHeight);  // Get the current height of the page to compare if new content loads after scrolling
    while (true) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));  // Scroll to the bottom of the page
        // Wait for the footer element to load, indicating that more content may have been loaded
        await page.waitForSelector('footer', { timeout: 5000 }).catch(() => {}); // Timeout ensures the scraper doesn't wait forever
        const currentHeight = await page.evaluate(() => document.body.scrollHeight);  // Get the new height of the page after scrolling
        if (currentHeight === previousHeight) break;   // If the height has not changed, break the loop as no new content is loading
        previousHeight = currentHeight;  // Update the previous height for the next iteration
    }
};

// Retry function to attempt scraping a URL multiple times in case of failure
const scrapeWithRetry = async (url, browser, retries = 3) => {
    let attempt = 0;
    while (attempt < retries) {   // Try scraping the page a maximum of `retries` times
        try {
            const page = await browser.newPage();  // Open a new page in the browser
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 }); // Navigate to the provided URL and wait for the page to load. Timeout is increased for large websites
            await scrollPage(page);  // Scroll the page to ensure dynamic content is loaded
            const links = await page.evaluate(() => {  // Extract product links from the page
                return Array.from(document.querySelectorAll('a'))  // Get all anchor (link) elements on the page
                    .map((a) => a.href) // Extract the href (URL) of each link
                    .filter((href) => 
                        // Filter links that match certain product-related patterns
                        /\/(product|item|p|shop|books|phones|computers)/i.test(href)
                    );
            });
            await page.close();   // Close the page after scraping to free up the resources.
            return links; // Return the product links found on the page
        } catch (error) {
            if (attempt === retries - 1) {  // If the scraping fails, retry up to the maximum number of attempts
                console.error(`Error scraping ${url}: ${error.message}`);
            }
            attempt++; // Increment attempt count and try again if possible
        }
    }return []; // Return an empty array if all retries fail
};

// Main function to scrape product links from multiple websites
const scrapeProducts = async (urls) => {
    const browser = await puppeteer.launch();    // Launch a browser instance using Puppeteer.
    const productLinks = {}  // Object to store product links from each website
    const { default: pLimit } = await import('p-limit');   // Dynamically import p-limit for controlling concurrency (limits the number of concurrent tasks)
    const limit = pLimit(3); // Limit concurrent scraping tasks to 3 (you can change this number based on your system's capability)
    
    const scrapeConcurrently = async (urls) => { // Function to scrape the list of URLs concurrently
        const promises = urls.map((url) =>   // Create an array of promises to scrape each URL concurrently (within the limit of 3 concurrent tasks)
            limit(() => scrapeWithRetry(url, browser).then((links) => {
                const domain = new URL(url).hostname; // Extract the domain name from the URL (e.g., "example.com")
                productLinks[domain] = [...new Set(links)]; // Store unique product links for this domain
                console.log(`Scraped ${productLinks[domain].length} product links from ${url}`);
            }))
        ); await Promise.all(promises);  // Wait for all scraping tasks to complete
    };
    await scrapeConcurrently(urls); // Call the function to start scraping the provided URLs
    await browser.close(); // Close the browser after scraping is complete
    return productLinks; // Return the collected product links
};

// List of websites to scrape the product urls.
const websites = [
    "https://webscraper.io/test-sites/e-commerce/allinone/computers",
    "https://webscraper.io/test-sites/e-commerce/allinone/phones",
    "https://demo.opencart.com",
    "https://books.toscrape.com",
    "https://scrapeme.live/shop",
    "https://fakestoreapi.com",
    "https://webscraper.io/test-sites/e-commerce/static",
    "https://www.techproducts.com",
    "https://www.samsung.com/us/",
    "https://www.walmart.com",
    "https://www.nike.com",
    "https://www.target.com/c/toys/-/N-5xt9n",
    "https://www.ikea.com/us/en/"
];

// Start the scraping process and save the product links to a file
const final = async () => {
    const productLinks = await scrapeProducts(websites); // Scrape product links from the provided websites.
    fs.writeFileSync('product_links.json', JSON.stringify(productLinks, null, 2));  // Save the productLinks to a JSON file names as product_links.
    console.log('Scraping completed. Product links saved to product_links.json'); //Log the output after completing the scraping.
};
final();
