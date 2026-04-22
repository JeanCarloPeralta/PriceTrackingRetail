#!/bin/bash

# Navigate to project directory
cd "/Users/jeancarlopc/Documents/Web Scrapper" || exit

# Run the batch scraper
echo "Starting daily scrape at $(date)" >> scrape_log.txt
/usr/local/bin/node scripts/batch_scrape.js >> scrape_log.txt 2>&1
echo "Finished daily scrape at $(date)" >> scrape_log.txt
