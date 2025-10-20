// Storage and API utilities
const getStoredSettings = async () => {
    const stored = await chrome.storage.local.get(CONFIG.storage.keys);
    return {
        token: stored.openrouterToken,
        direction:
            stored.translationDirection ||
            CONFIG.storage.defaults.translationDirection,
        model: stored.selectedModel || CONFIG.storage.defaults.selectedModel,
    };
};

const callTranslationAPI = async (
    text,
    token,
    direction = "to-english",
    model,
) => {
    const instruction =
        direction === "to-darija"
            ? CONFIG.prompts.instructions.toDarija
            : CONFIG.prompts.instructions.toEnglish;

    const prompt = CONFIG.prompts.base(text, instruction);

    const response = await fetch(CONFIG.api.endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            ...CONFIG.api.headers,
        },
        body: JSON.stringify({
            model: model || CONFIG.api.defaultModel,
            messages: [{ role: "user", content: prompt }],
            max_tokens: CONFIG.api.maxTokens,
        }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    console.log(content);

    // Always strip translation tags and clean up
    return content
        .replace(/<?\/?\s*translation\s*>?/gi, "")
        .replace(/^\*\*.*?\*\*|\*\*.*?\*\*$|^#+\s*/g, "")
        .trim();
};
