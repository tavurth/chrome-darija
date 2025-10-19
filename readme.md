# Darija Translator Chrome Extension

A Chrome extension that translates Darija (Moroccan Arabic) messages in Instagram DMs with a single click.

## Features

- **One-click translation** - Click any message to translate it instantly
- **Keyboard shortcut** - Select text and press Ctrl+Shift+T to translate in opposite direction
- **Bidirectional translation** - Switch between English↔Darija in settings
- **Toggle functionality** - Click again to restore original text
- **Multi-language support** - Translates between English and Darija (Moroccan Arabic)
- **Real-time detection** - Works with new messages as they load
- **Clean interface** - Seamless integration with Instagram's UI

## Installation

1. **Clone or download this repository**
   ```bash
   git clone git@github.com:tavurth/chrome-darija.git
   ```

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the downloaded `chrome-darija` folder

3. **Configure API access**
   - Sign up at [OpenRouter](https://openrouter.ai) 
   - Generate an API key
   - Click the extension icon in Chrome toolbar
   - Enter your API key and translation direction
   - Click "Save Settings"

## Usage

### Click Translation
1. Navigate to Instagram DMs (`instagram.com/direct/...`)
2. Click any message to translate it based on your selected direction
3. Click the translated message to restore the original text

### Keyboard Shortcut
1. Select any text in Instagram DMs
2. Press Ctrl+Shift+T to translate in the opposite direction
3. The selected text will be replaced with the translation

## Technical Details

- **Translation API**: OpenRouter with Gemini 2.5 Flash
- **Cost**: ~$0.0000015 per translation
- **Supported pages**: Instagram Direct Messages only
- **Response format**: Structured JSON for reliable extraction

## File Structure

```
chrome-darija/
├── manifest.json    # Extension configuration
├── popup.html      # Settings interface
├── popup.js        # Token management
├── content.js      # Main translation logic
└── README.md       # This file
```

## Privacy

- No data is stored or transmitted except for translation requests
- API key is stored locally in Chrome's extension storage
- Only works on Instagram Direct Message pages

## License

MIT License - feel free to fork and modify
