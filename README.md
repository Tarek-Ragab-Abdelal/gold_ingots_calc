> App can be found here [gold.tarekragab.com]()

# Gold Calculator — حاسبة الذهب

A mobile-first gold price calculator for the Egyptian market. Fetches live gold prices in Egyptian Pounds (EGP) and lets you convert between a money amount and a gold quantity in either direction. Supports English and Arabic with full RTL layout.

## Features

**Calculator modes**

- Gold to cash — given a product, quantity, and weight, compute the total buy or sell value including fees.
- Cash to gold — given a budget, compute how many whole pieces or fractional grams you can buy or sell.

**Gold types supported:** 18K, 21K, 24K. Each karat has its own fee structure. 18K supports a custom fee override; otherwise a 2% default is applied.

**Prices and data**

- Live prices fetched from multiple sources in order of preference (see [API sources](#api-sources) below).
- USD/EGP exchange rate fetched separately and cached for 5 minutes.
- Last-updated timestamp shown in the header.
- Manual refresh button.

**Other**

- Calculation history stored in localStorage.
- Dark and light theme.
- Installable as a PWA (web app manifest + custom icon).
- Arabic and English localization including number formatting.

## Tech stack

| Layer     | Choice                           |
| --------- | -------------------------------- |
| Framework | Next.js 15 (App Router)          |
| Language  | TypeScript 5                     |
| Styling   | Plain CSS with custom properties |
| Runtime   | React 18                         |

No UI library, no CSS framework, no state management library.

## Project structure

```
src/
  app/
    globals.css          # All styles — design tokens, layout, components
    layout.tsx           # Root layout, metadata, font loading
    page.tsx             # Entry point, mounts GoldCalculatorApp
  components/
    GoldCalculatorApp.tsx  # Root component, wires everything together
    AppHeader.tsx          # Market overview, theme/language toggles
    QuickActions.tsx       # Refresh, history, share buttons
    CalculatorSection.tsx  # Calculator form and result card
    ResultCard.tsx         # Formatted result display
    HistoryModal.tsx       # Slide-up history panel
    AppFooter.tsx          # Footer links and disclaimer
  hooks/
    useGoldCalculator.ts   # All state, effects, and handlers
  lib/
    types.ts               # TypeScript interfaces and constants
    goldApi.ts             # Price fetching with fallback chain
    calculator.ts          # Calculation logic
    localization.ts        # Translations and number formatting
    storage.ts             # localStorage read/write
public/
  icon.svg               # App icon (SVG, used for favicon and PWA)
  manifest.json          # Web app manifest
```

## Getting started

**Prerequisites:** Node.js 18 or later.

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open `http://localhost:3000` in your browser.

```bash
# Type-check without emitting
npm run type-check

# Production build
npm run build
npm run start
```

## API sources

Gold prices are fetched from the following sources in priority order. The app moves to the next source automatically if one fails.

| Priority | Source                       | Notes                           |
| -------- | ---------------------------- | ------------------------------- |
| 1        | banklive.net                 | Scraped HTML via CORS proxy     |
| 2        | Bullion Trading Center (BTC) | JSON endpoint, EGP prices       |
| 3        | Metals-API                   | Requires an API key             |
| 4        | gold-api.com / metals.live   | Free tier, USD converted to EGP |
| 5        | Static estimate              | Last resort, approximate only   |

When prices come from a USD-denominated source, the USD/EGP rate is fetched from exchangerate-api.com with a 5-minute cache and a hardcoded fallback of 47.5.

### BTC API endpoint

```
POST https://bulliontradingcenter.com/wp-admin/admin-ajax.php
Content-Type: application/x-www-form-urlencoded

action=btc_get_stock_ajax
```

**Response shape:**

```json
{
  "success": true,
  "data": {
    "obj": {
      "table": [
        { "id": 153, "formatted_name": "21K Gold", "ask": 5200, "bid": 5100 }
      ],
      "updated_date": "1 March 2026",
      "updated_time": "10:00 AM"
    }
  }
}
```

## Fee logic

| Karat | Default fee                                                        |
| ----- | ------------------------------------------------------------------ |
| 18K   | 2% of the product value (overridable with a custom EGP/gram input) |
| 21K   | Fixed per-gram fee defined in `GOLD_PRODUCTS_CONFIG`               |
| 24K   | Fixed per-gram fee defined in `GOLD_PRODUCTS_CONFIG`               |

## Privacy

All data stays on the device. Calculation history and user preferences are stored in `localStorage` only. No analytics, no tracking.

## License

MIT. See [package.json](package.json) for details.

> This is developed and maintained by [Tarek Ragab](TarekRagab.com "Portfolio")

## Disclaimer

Prices shown are for reference only. Always verify with an official source before making any financial decisions.
