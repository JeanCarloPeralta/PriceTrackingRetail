# Price Track - Implementation Plan

## Phase 1: Core Dashboard (Complete)
- [x] Initial React dashboard setup
- [x] Firebase integration for live data
- [x] Product Grid and Table views
- [x] Basic search and store filtering
- [x] Stats cards for total products and average price

## Phase 2: Advanced Features (In Progress)

### 1. Data Expansion & Hygiene
- [x] **Alcoholic Beverages Support**: Added keywords for beer, wine, and liquor.
- [x] **Perishable Exclusion**: Updated cleanup logic to remove fresh produce/meats.
- [x] **Category Refining**: Improved category filtering to keep only non-perishable groceries.
- [x] **UPC Deduplication**: Ensure multi-store products are perfectly merged by UPC (Metadata Sync).

### 2. Analytics & Insights
- [x] **Comparative Basket**: Formula implementation for MxM vs Walmart pricing gap.
- [x] **Historical Gap Performance**: Recharts integration for tracking price trends over time.
- [x] **CSV Export**: Download current filtered view as a structured CSV.
- [ ] **Brand Filtering**: Add a dedicated filter for top brands.

### 3. Branding & UX (Updated)
- [x] **Logo Design**: Custom Price Track logo (Shopping cart + Magnifier).
- [x] **Favicon**: Integrated custom branding into the browser tab.
- [x] **UI Cleanup**: Removed redundant buttons and simplified the header.
- [x] **Dynamic Submenu**: Added monitoring status and store list to header.

### 4. Automation & Scaling (Next Steps)
- [x] **Weekly Scrape Setup**: Configure automated runs for every Monday via GitHub Actions.
- [x] **Cloud Functions / GitHub Actions**: Move scraping to a scheduled cloud environment.
- [ ] **Data Integrity Audit**: Continuous monitoring of UPC accuracy.

## Current Focus
We have successfully implemented the **Weekly Scrape Automation** and **UPC Metadata Sync**. The project is now in a stable production state. The next steps involve a Brand-based filter and ongoing data integrity audits.
