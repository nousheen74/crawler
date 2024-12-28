# Web Scraper for Product Links

This project uses Puppeteer to scrape product links from multiple e-commerce websites and saves them into a `product_links.json` file. It handles infinite scrolling on websites with dynamic content, retries failed requests to ensure successful scraping, and limits concurrency to optimize performance.

## Prerequisites

Before running this project, ensure that you have the following installed:

1. [Node.js](https://nodejs.org/) (version 14 or higher)
2. [npm](https://www.npmjs.com/) (Node.js package manager)

## Getting Started

Follow these steps to get your project up and running:

### Step 1: Install Dependencies

1. Create a new folder for your project if you haven't already.
2. Open a terminal/command prompt in the project folder.
3. Initialize a new Node.js project by running:

    ```bash
    npm init -y
    ```

4. Install the required packages by running:

    ```bash
    npm install puppeteer p-limit
    ```

    - **puppeteer**: A library used to control a headless version of Chrome or Chromium to automate tasks like web scraping.
    - **p-limit**: A library to control the concurrency of tasks, ensuring that only a certain number of tasks are running at the same time.

### Step 2: Set Up the Scraper

1. Copy the `scraper.js` file (the code provided above) into your project folder.
2. Make sure the URLs listed in the `websites` array are the ones you want to scrape. You can add or remove websites from the list.

### Step 3: Run the Scraper

1. In the terminal, run the following command to start the scraping process:

    ```bash
    node scraper.js
    ```

2. The program will visit each website, scrape product links, and save them into a `product_links.json` file in the project folder.

### How It Works:

- **Infinite Scrolling**: Many websites load new content as you scroll down the page. The scraper automatically scrolls the page to load all available products before extracting the links.
- **Retries**: If the scraper encounters an error when trying to scrape a website (such as a timeout or network issue), it will automatically retry up to 3 times before giving up. You can adjust the number of retries if necessary.
- **Concurrency Control**: The scraper limits the number of concurrent scraping tasks to 3 using the `p-limit` package. This helps avoid overloading the system and makes the scraping more efficient, especially when scraping multiple websites at once.

### Files Generated:

- **product_links.json**: This file contains the scraped product links from the websites you specified. It stores the links in a structured format, grouped by domain.

    Example:

    ```json
    {
      "webscraper.io": [
        "https://webscraper.io/test-sites/e-commerce/allinone/computers/product-1",
        "https://webscraper.io/test-sites/e-commerce/allinone/phones/product-2"
      ],
      "demo.opencart.com": [
        "https://demo.opencart.com/index.php?route=product/product&product_id=1"
      ]
    }
    ```

### How to Use:

1. **Modify the List of Websites**: The `websites` array contains the URLs of the websites you want to scrape. Feel free to add or remove websites from this list. Just ensure that the URLs follow the pattern expected by the scraper (e.g., links should contain words like `product`, `item`, `shop` in the URL).

2. **Run the Scraper**: After setting up your websites, run the scraper using the `node scraper.js` command. The scraper will automatically open each website, scroll to load content, extract product links, and save the results to a file.

3. **Check the Results**: Once the scraping is complete, check the `product_links.json` file in your project folder for the list of product links scraped from the websites.

### Troubleshooting

- **Scraping Doesn't Work for a Specific Website**: Some websites might block scraping tools or require a different approach. If you're unable to scrape certain websites, try adjusting the `timeout` or add custom error handling for specific cases.

- **Slow Scraping**: If the scraper is running too slowly, you can try increasing the concurrency limit (though keep in mind that too many concurrent requests might overload the system or get you blocked by the websites). You can change the concurrency limit by modifying this line in the code:

    ```javascript
    const limit = pLimit(3); // Change 3 to a higher number to scrape more websites concurrently
    ```

- **Network Issues or Timeouts**: If the scraper is running into timeouts or network issues, ensure that the websites you're scraping are accessible and that your internet connection is stable. You can increase the timeout value to allow more time for websites to load.

### Example Output:

After running the scraper, the product links will be saved in `product_links.json` in the following structure:

```json
{
  "example.com": [
    "https://example.com/product/123",
    "https://example.com/product/456"
  ],
  "another-example.com": [
    "https://another-example.com/product/789"
  ]
}
