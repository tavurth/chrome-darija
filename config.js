// Configuration constants
const CONFIG = {
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
Only reply with a single version of the translation.
Never end with a full stop at the last line.

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
