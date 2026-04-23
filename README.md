# Pricetrackretail (Sweet Retailer Dashboard)

Pricetrackretail is a comprehensive web scraper and dashboard application designed to track retail prices across multiple stores and provide detailed analytics. It uses Puppeteer for reliable web scraping, Firebase for data storage and hosting, and a React + Vite frontend styled with Tailwind CSS and Recharts for data visualization.

## Live Link
The project is deployed and live at: [https://pulperia-m-9137d.web.app/](https://pulperia-m-9137d.web.app/)

## Features
- **Automated Web Scraping:** Uses Puppeteer to extract accurate product data, pricing, and UPCs from major retailer websites.
- **Data Dashboard:** A React-based interface to analyze product data, overlapping inventory, and price comparisons.
- **Firebase Integration:** Seamless storage of scraped data in Firestore and deployment via Firebase Hosting.
- **Weekly Automated Scraping:** Configured with GitHub Actions to run a full price scan every **Monday at 00:00 UTC**.

## How to Run Locally

### Prerequisites
- Node.js (v18+ recommended)
- A Firebase project with a valid `serviceAccountKey.json` placed in the root directory for database access.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/jeancarlopc/Pricetrackretail.git
   cd Pricetrackretail
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Scrapers
To update the data with the latest information from the retailers:
```bash
npm run scrape:all
```
*Note: You can also run specific scrapers via `npm run scrape` or `npm run scrape:am`.*

### Running the Development Server
To start the React frontend:
```bash
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

### Deployment
To build and deploy the app to Firebase Hosting:
```bash
npm run deploy
```
