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
- [x] **UPC Deduplication**: Synchronized names, images, and categories across retailers via metadata sync.

### 2. Analytics & Insights
- [x] **Comparative Basket**: Formula implementation for MxM vs Walmart pricing gap.
- [x] **Historical Gap Performance**: Recharts integration for tracking price trends over time.
- [x] **CSV Export**: Download current filtered view as a structured CSV.
- [ ] **Brand Filtering**: Add a dedicated filter for top brands.

### 3. Branding & UX (Updated)
- [x] **Logo Design**: Custom Price Track logo (Shopping cart + Magnifier).
- [x] **Favicon**: Integrated high-quality transparent SVG favicon.
- [x] **UI Cleanup**: Removed redundant buttons and simplified the header.
- [x] **Dynamic Submenu**: Added monitoring status and store list to header.

### 4. Automation & Scaling (Complete)
- [x] **Weekly Scrape Setup**: Configured GitHub Actions to run every Monday at 00:00 UTC.
- [x] **Cloud-Based Execution**: Scraping now runs in a scheduled GitHub Actions environment.

## Current Focus
Phase 2 is largely complete. The system is now fully automated and data-consistent. The next remaining item is adding **Brand Filtering** to the dashboard to allow more granular competitive analysis.
