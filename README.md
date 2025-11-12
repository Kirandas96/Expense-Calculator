# Expense Calculator

A simple and elegant expense tracking web application built with vanilla JavaScript, featuring beautiful charts and comprehensive analytics.

## Features

- **Expense Management**: Add, edit, and delete expenses with categories and dates
- **Category Management**: Create and manage custom categories with color coding
- **Budget Tracking**: Set overall or category-specific budgets with visual progress indicators
- **Date Filtering**: Filter expenses and analytics by custom date ranges
- **Visual Analytics**: 
  - Line chart showing spending trends over time
  - Bar chart displaying expenses by category
  - Pie chart for category distribution
- **Advanced Analytics**: 
  - Total expenses calculation
  - Monthly spending summary
  - Category breakdown with percentages
  - Budget vs actual spending comparison
- **Local Storage**: All data persists in browser localStorage
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Getting Started

1. Open `index.html` in a modern web browser
2. No installation or build process required - it's ready to use!

## Usage

### Adding Expenses
1. Navigate to the "Expenses" section
2. Fill in the expense form with:
   - Amount
   - Description
   - Category (create categories first if needed)
   - Date
3. Click "Add Expense"

### Managing Categories
1. Go to the "Categories" section
2. Add a new category with a name and color
3. Edit or delete existing categories as needed

### Setting Budgets
1. Navigate to the "Budgets" section
2. Choose between:
   - Overall Budget (total spending limit)
   - Category Budget (spending limit for a specific category)
3. Set the amount and period (monthly, weekly, or yearly)
4. View progress bars showing budget status

### Viewing Analytics
1. Go to the "Dashboard" section
2. Use date filters to analyze specific time periods
3. Switch between different chart types using the tabs
4. View summary cards and category breakdowns

## Technical Details

- **Frontend**: Vanilla JavaScript (ES6+)
- **Charts**: Chart.js (loaded via CDN)
- **Storage**: Browser localStorage
- **Styling**: Modern CSS with Grid and Flexbox
- **No Dependencies**: Pure vanilla JavaScript - no build tools required

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- localStorage API
- CSS Grid and Flexbox

## Data Storage

All data is stored locally in your browser's localStorage. Your data will persist between sessions but is specific to the browser and device you're using.

## License

This project is open source and available for personal use.

