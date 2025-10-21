// Configuration constants
const CONFIG = {
  selectors: {
    // Platform detection
    dmContainer: '[role="main"], [data-pagelet="MWThreadView"]',

    // Multi-platform message selectors
    messageText: [
      'div[dir="auto"]', // Instagram
      '.x1lliihq span[dir="auto"] div', // Facebook/Messenger
      '[data-scope="messages_table"] div[dir="auto"]',
      '.html-div[dir="auto"]', // Facebook variant
    ].join(', '),

    // Clickable message containers
    messageElement: [
      '[role="button"][aria-label*="tap"]', // Instagram
      '[data-scope="messages_table"] div', // Facebook
      '.x1lliihq', // Facebook message wrapper
      '[role="presentation"]', // Facebook container
    ].join(', '),
  },
  api: {
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'google/gemini-2.5-flash',
    maxTokens: 50,
    headers: {
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://instagram.com',
      'X-Title': 'Darija Translator',
    },
  },
  prompts: {
    base: (text, instruction) =>
      `${instruction}: "${text}". 
        
Context: Darija uses numbers for Arabic letters (3=ع, 7=ح, 9=ق, 2=ء, 5=خ, 8=غ, 6=ط, 4=ذ). 
Common patterns: "Hhhhhh" = laughter/LOL, repeated letters for emphasis, French/Arabic/English mixing is normal.
Be natural and conversational.

Keep newlines as the original text had.

YOU MUST Return only: <translation>your translation here</translation> DO NOT OMIT TAGS`,

    instructions: {
      toDarija: 'Translate to latin Darija (Moroccan Arabic without arabic script)',
      toEnglish: 'Translate this Darija/French mixed text to natural English',
    },
  },
  storage: {
    keys: ['openrouterToken', 'translationDirection', 'selectedModel'],
    defaults: {
      translationDirection: 'to-english',
      selectedModel: 'google/gemini-2.5-flash',
    },
  },
  debounceMs: 100,
}
