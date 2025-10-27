# Gold Calculator - Modular TypeScript Architecture

A professional gold price calculator with real-time prices, Arabic/English support, and comprehensive calculation features.

## 🏗️ Architecture Overview

The application has been completely refactored into a modular TypeScript architecture:

### 📁 Module Structure

```
js/
├── types.ts          # TypeScript interfaces and type definitions
├── localization.ts   # Multi-language support (EN/AR)
├── goldApi.ts        # API service with fallback sources
├── calculator.ts     # Gold calculation logic
├── uiManager.ts      # DOM manipulation and UI updates
├── storage.ts        # localStorage operations and history
└── main.ts          # Main application orchestrator
```

### 🔧 Key Features

- **Multi-API Support**: Primary BTC API with fallbacks (Metals-API, Gold-API.io, etc.)
- **Type Safety**: Full TypeScript implementation with comprehensive interfaces
- **Modular Design**: Separation of concerns across focused modules
- **Error Handling**: Robust error handling with fallback mechanisms
- **Internationalization**: English/Arabic language support with RTL/LTR layouts
- **Local Storage**: Persistent settings and calculation history
- **Responsive UI**: Mobile-first design with PWA capabilities

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Build TypeScript files
npm run build

# Start development with file watching
npm run dev

# Serve the application
npm start
```

### API Configuration

The app supports multiple gold price sources:

1. **BTC API** (Primary): https://bulliontradingcenter.com
2. **Metals-API** (Fallback): Requires API key
3. **Gold-API.io** (Fallback): Free tier available
4. **Exchange Rate API** (Emergency): Static fallback

API keys can be configured in the app settings.

## 📋 Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:watch` - Watch mode compilation
- `npm run dev` - Development mode with watching
- `npm run clean` - Remove compiled JavaScript files
- `npm run lint` - Run ESLint on TypeScript files
- `npm run type-check` - Type checking without compilation
- `npm start` - Build and serve the application

## 🧩 Module Details

### Types Module (`types.ts`)

- Comprehensive TypeScript interfaces
- API response types
- Configuration schemas
- Error class definitions

### Localization Module (`localization.ts`)

- Multi-language support (English/Arabic)
- Number formatting with locale support
- RTL/LTR layout handling
- Dynamic DOM text updates

### API Service Module (`goldApi.ts`)

- Primary BTC API integration
- Fallback API strategies
- Error handling and retry logic
- Standard product conversion

### Calculator Module (`calculator.ts`)

- Gold-to-money calculations
- Money-to-gold conversions
- Fee calculations and rounding
- Input validation
- Advanced features (spreads, break-even analysis)

### UI Manager Module (`uiManager.ts`)

- DOM manipulation
- Theme management
- Toast notifications
- Modal handling
- Result display formatting

### Storage Service Module (`storage.ts`)

- localStorage operations
- Calculation history management
- Configuration persistence
- Data import/export
- Storage usage monitoring

### Main Application (`main.ts`)

- Service orchestration
- Event binding
- Application lifecycle
- Auto-refresh scheduling

## 🌐 Browser Compatibility

- Modern browsers with ES2021 support
- Chrome 85+, Firefox 79+, Safari 14+, Edge 85+
- PWA capabilities for mobile installation

## 🔧 Customization

### Adding New Languages

1. Extend the `Language` type in `types.ts`
2. Add translations to `localization.ts`
3. Update number formatting logic

### Adding New APIs

1. Create new API interface in `types.ts`
2. Implement API strategy in `goldApi.ts`
3. Add to fallback chain

### Extending Calculations

1. Add new calculation types to `types.ts`
2. Implement logic in `calculator.ts`
3. Update UI display in `uiManager.ts`

## 📱 PWA Features

- Service worker for offline functionality
- Web app manifest for installation
- Responsive design for mobile devices
- Touch-friendly interface

## 🔐 Security Considerations

- API keys stored in localStorage (consider upgrading to secure storage)
- Input validation and sanitization
- HTTPS recommended for production
- No sensitive data transmission

## 🐛 Development

### TypeScript Configuration

- Strict type checking enabled
- ES2021 target for modern features
- Source maps for debugging
- Module resolution for imports

### Code Quality

- ESLint configuration for TypeScript
- Consistent coding standards
- Error boundary patterns
- Comprehensive error handling

## 📄 License

MIT License - see package.json for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with TypeScript
4. Run `npm run build` to compile
5. Test thoroughly
6. Submit a pull request

---

**Note**: This refactored version maintains all original functionality while providing a much more maintainable, scalable, and type-safe codebase.
