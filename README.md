# BTC Gold Calculator | حاسبة الذهب

A modern, feature-rich gold price calculator with Arabic localization and PWA capabilities.

## 🚀 Features

### 📱 Mobile-First Design

- Responsive design optimized for mobile devices
- Touch-friendly interface
- Swipe gestures support
- Fast loading and smooth animations

### 🌍 Multilingual Support

- English and Arabic interface
- RTL (Right-to-Left) layout for Arabic
- Localized number formatting
- Cultural-appropriate design elements

### 🎨 Modern UI/UX

- Dark/Light theme toggle
- Beautiful gradients and animations
- Card-based layout
- Professional typography with Arabic font support (Cairo)

### 💰 Advanced Calculator Features

- Real-time price fetching from BTC API
- Multiple product types (ingots, jewelry, coins)
- Bulk calculation (weight × quantity)
- Buy/Sell price comparison
- Quick calculation buttons on product cards

### ⭐ Smart Features

- **Favorites System**: Save frequently used products
- **Calculation History**: Track your previous calculations
- **Price Alerts**: Get notified when prices reach target values
- **Search & Filter**: Find products quickly
- **Statistics Dashboard**: Market overview and trends

### 🔍 Enhanced Product Display

- Comprehensive product grid
- Category-based filtering (All, Ingots, Jewelry, Coins)
- Search functionality with multilingual support
- Favorite products management
- Real-time price updates

### 📊 Market Information

- Gold and Silver international prices
- Market statistics (highest/lowest prices)
- Last updated timestamps
- Price trend indicators

### 💾 Data Management

- Local storage for user preferences
- Calculation history persistence
- Favorites synchronization
- Alert management

### 🔔 Notifications

- Toast notifications for user feedback
- Price alert notifications
- Error handling with user-friendly messages
- Success confirmations

### 📱 PWA (Progressive Web App)

- Installable on mobile devices
- Offline functionality with service worker
- App-like experience
- Fast loading with caching

### 🎯 Accessibility Features

- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Reduced motion support for accessibility

## 🛠 Technical Implementation

### Architecture

- **Class-based JavaScript**: Modern ES6+ syntax
- **Modular Design**: Separated concerns and functionality
- **Event-driven**: Reactive UI updates
- **Local Storage**: Client-side data persistence

### Performance

- **Lazy Loading**: Images and content loaded on demand
- **Caching Strategy**: Service worker for offline support
- **Optimized Assets**: Compressed images and minified code
- **Fast Rendering**: Efficient DOM manipulation

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## 📦 File Structure

```
├── index.html          # Main HTML structure
├── style.css           # Enhanced CSS with themes and RTL support
├── script.js           # Complete JavaScript application
├── sw.js               # Service Worker for PWA
├── manifest.json       # Web App Manifest
├── logo.png            # Application icon
└── README.md          # This file
```

## 🔧 Setup and Installation

1. **Clone or download** the repository
2. **Serve the files** using any web server (local or remote)
3. **Access via browser** - the app will work immediately
4. **Install as PWA** using browser's "Add to Home Screen" option

### Local Development

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

## 🎨 Customization

### Themes

The app supports light and dark themes with CSS custom properties:

```css
:root {
  --primary-color: #d4af37; /* Gold color */
  --background-color: #f8f9fa;
  --text-primary: #333333;
  /* ... more variables */
}
```

### Languages

Add new languages by extending the translations object in `script.js`:

```javascript
this.translations = {
  en: {
    /* English translations */
  },
  ar: {
    /* Arabic translations */
  },
  // Add more languages here
};
```

## 🔄 API Integration

The app fetches real-time data from:

```
POST https://bulliontradingcenter.com/wp-admin/admin-ajax.php
Body: action=btc_get_stock_ajax
```

### Data Structure

```json
{
  "success": true,
  "data": {
    "obj": {
      "table": [
        {
          "id": 153,
          "name": "5G/24K E",
          "ask": 31368,
          "bid": 30880,
          "formatted_name": "5 Gram Ingot"
        }
      ],
      "table_heads": {
        "gold": { "ask": 4031.48 },
        "silver": { "ask": 48.9 }
      },
      "updated_date": "8 October 2025",
      "updated_time": "4:40 PM"
    }
  }
}
```

## 📱 Mobile Features

### Touch Interactions

- Swipe gestures for navigation
- Pull-to-refresh for price updates
- Touch-optimized button sizes
- Smooth scrolling and animations

### Performance Optimizations

- Image lazy loading
- Efficient event handling
- Minimal DOM manipulation
- Cached assets for fast loading

## 🔐 Privacy and Security

- **No personal data collection**: All data stored locally
- **Secure HTTPS**: Recommended for production
- **No tracking**: User privacy respected
- **Local storage only**: Data never leaves the device

## 🚀 Future Enhancements

### Planned Features

- [ ] Chart integration for price trends
- [ ] Currency conversion (USD, EUR, etc.)
- [ ] Export calculations to PDF/Excel
- [ ] Push notifications for price alerts
- [ ] Social sharing improvements
- [ ] More languages (French, Spanish, etc.)
- [ ] Advanced filtering options
- [ ] Price prediction algorithms
- [ ] Integration with more gold markets

### Technical Improvements

- [ ] TypeScript migration
- [ ] Unit testing suite
- [ ] E2E testing with Cypress
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Error tracking integration

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow existing code style and patterns
2. Add comments for complex functionality
3. Test on multiple devices and browsers
4. Ensure accessibility compliance
5. Update documentation as needed

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Contact: [Support Email/Link]

## 🙏 Acknowledgments

- **BTC (Bullion Trading Center)** for providing the API
- **Font Awesome** for icons
- **Google Fonts (Cairo)** for Arabic typography
- **Community contributors** for feedback and suggestions

---

**Made with ❤️ for the gold trading community**

_This calculator provides reference prices only. Always verify with official sources before making trading decisions._
