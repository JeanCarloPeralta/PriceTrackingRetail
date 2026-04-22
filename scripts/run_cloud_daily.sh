#!/bin/bash

# Cloud Scraping Script
# Should be added to crontab on the host machine:
# 0 0 * * * /path/to/project/scripts/run_cloud_daily.sh

cd "$(dirname "$0")/.." || exit

echo "Starting cloud scrape at $(date)" >> cloud_scrape.log

# Run batch scrape inside the scraper container
docker exec walmart_scraper node scripts/batch_scrape.js >> cloud_scrape.log 2>&1

echo "Finished cloud scrape at $(date)" >> cloud_scrape.log
