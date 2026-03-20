# Trackify - Personal Finance Tracker

A modern, highly animated personal finance tracker built with vanilla HTML, CSS, and JavaScript. Track your income and expenses with a beautiful, responsive UI featuring smooth animations, animated charts, and dark mode support.

![Trackify](https://img.shields.io/badge/Trackify-Finance%20Tracker-6C63FF?style=for-the-badge)

## Features

- **Add Transactions** — Record income and expenses with amount, type, category, date, and description
- **Delete Transactions** — Remove entries with smooth slide-out animations
- **Financial Summary** — View total balance, income, and expenses with animated counters
- **Transaction History** — Scrollable list with category badges and color-coded entries
- **Filter & Search** — Filter transactions by category or date
- **Animated Charts** — Doughnut chart for spending breakdown and bar chart for income vs expenses (powered by Chart.js)
- **Dark Mode** — Toggle between light and dark themes with smooth transitions
- **Local Storage** — All data persists in the browser using localStorage
- **Fully Responsive** — Mobile-first design that looks great on all screen sizes
- **Highly Animated** — Page load animations, hover effects, scroll reveals, ripple buttons, animated counters, and more

## Animations & Micro-Interactions

- Smooth page load fade/slide animations
- Button hover glow, ripple, and lift effects
- Card hover elevation and icon scaling
- Animated entry/exit for transactions
- Input focus animations with error shake
- Smooth number counting for balance/income/expenses
- Chart grow/draw animations
- Dark mode toggle with icon rotation transition
- Floating gradient background blobs
- Scroll-based reveal animations
- Toast notification slide-in/out

## Security

- All user inputs are sanitized to prevent XSS
- No use of `innerHTML` with user-provided data
- Strict field validation on all form inputs
- `"use strict"` enforced in JavaScript

## Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, animations, keyframes, transitions, grid, flexbox
- **Vanilla JavaScript** — ES6+ modules pattern, no frameworks
- **Chart.js** (CDN) — For animated doughnut and bar charts
- **Google Fonts** — Inter font family

## How to Run

### Option 1: Open Directly
Simply open `index.html` in any modern web browser.

```bash
# Clone the repository
git clone https://github.com/<your-username>/trackify.git
cd trackify

# Open in browser
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

### Option 2: Local Server
For a better development experience, use a local server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## GitHub Pages Deployment

1. Push the code to your GitHub repository
2. Go to **Settings** > **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Choose the **main** branch and **/ (root)** folder
5. Click **Save**
6. Your site will be live at `https://<your-username>.github.io/trackify/`

## Project Structure

```
trackify/
├── index.html      # Main HTML file
├── style.css       # All styles, animations, and responsive design
├── script.js       # Application logic, storage, charts, validation
├── assets/         # Static assets directory
└── README.md       # Project documentation
```

## Browser Support

- Chrome 80+
- Firefox 78+
- Safari 14+
- Edge 80+

## License

MIT
