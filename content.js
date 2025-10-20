// Configuration
const CONFIG = {
    selectors: {
        dmContainer: '[role="main"]',
        messageText: 'div[dir="auto"]',
        messageElement: '[role="button"][aria-label*="tap"]',
    },
    api: {
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        defaultModel: "google/gemini-2.5-flash",
        maxTokens: 50,
        headers: {
            "Content-Type": "application/json",
            "HTTP-Referer": "https://instagram.com",
            "X-Title": "Darija Translator",
        },
    },
    prompts: {
        base: (text, instruction) =>
            `${instruction}: "${text}". YOU MUST Return only: <translation>your translation here</translation> DO NOT OMIT TAGS`,
        instructions: {
            toDarija:
                "Translate to latin Darija (Moroccan Rabat Arabic without arabic script, use numbers for Arabic letters like 3=ع, 7=ح, 9=ق, 2=ء, 5=خ, 8=غ)",
            toEnglish: "Translate to English this likely French or Darja text",
        },
    },
    storage: {
        keys: ["openrouterToken", "translationDirection", "selectedModel"],
        defaults: {
            translationDirection: "to-english",
            selectedModel: "google/gemini-2.5-flash",
        },
    },
    debounceMs: 100,
};

const findMessageElement = (target) => {
    return target.closest(CONFIG.selectors.messageElement);
};

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

const showLoadingAnimation = (element) => {
    let dotCount = 0;
    const animation = setInterval(() => {
        dotCount = (dotCount % 3) + 1;
        element.textContent = ".".repeat(dotCount);
    }, 500);

    element.dataset.loadingInterval = animation;
    return animation;
};

const clearLoadingAnimation = (element) => {
    const intervalId = element.dataset.loadingInterval;
    if (intervalId) {
        clearInterval(intervalId);
        delete element.dataset.loadingInterval;
    }
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
        .replace(/<\/?translation>/g, "")
        .replace(/^\*\*.*?\*\*|\*\*.*?\*\*$|^#+\s*/g, "")
        .trim();
};

const replaceMessageText = (textElement, originalText, translation) => {
    if (translation === originalText) return;

    textElement.dataset.originalText = originalText;
    textElement.dataset.translated = "true";
    textElement.textContent = translation;
};

const translateMessage = async (textElement, originalText) => {
    const { token, direction, model } = await getStoredSettings();
    if (!token) {
        console.error("Darija Translator: No API token configured");
        return;
    }

    const loadingInterval = showLoadingAnimation(textElement);

    try {
        const translation = await callTranslationAPI(
            originalText,
            token,
            direction,
            model,
        );
        clearLoadingAnimation(textElement);

        if (translation) {
            replaceMessageText(textElement, originalText, translation);
        } else {
            textElement.textContent = originalText;
        }
    } catch (error) {
        clearLoadingAnimation(textElement);
        console.error("Translation failed:", error);
        textElement.textContent = originalText;
    }
};

const handleMessageClick = async (event) => {
    const messageElement = findMessageElement(event.target);
    if (!messageElement) return;

    const textElement = messageElement.querySelector(
        CONFIG.selectors.messageText,
    );
    if (!textElement) return;

    if (textElement.dataset.translated === "true") {
        textElement.textContent = textElement.dataset.originalText;
        textElement.dataset.translated = "false";
        return;
    }

    const originalText = textElement.textContent?.trim();
    if (!originalText) return;

    await translateMessage(textElement, originalText);
};

const addClickListener = () => {
    const container = document.querySelector(CONFIG.selectors.dmContainer);
    if (!container) {
        console.error("DM container not found");
        return;
    }

    container.removeEventListener("click", handleMessageClick);
    container.addEventListener("click", handleMessageClick);
};

const observeNewMessages = () => {
    let debounceTimer;

    const observer = new MutationObserver((mutations) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            addClickListener();
        }, CONFIG.debounceMs);
    });

    const container = document.querySelector(CONFIG.selectors.dmContainer);
    if (container) {
        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: false,
        });
    }
};

const replaceSelectedText = (translation) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        document.execCommand("insertText", false, translation);

        const target =
            range.commonAncestorContainer.parentElement ||
            range.commonAncestorContainer;
        if (target && target.dispatchEvent) {
            target.dispatchEvent(new Event("input", { bubbles: true }));
            target.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }
};

const handleSelectionTranslation = async (selectedText) => {
    const { token, direction, model } = await getStoredSettings();
    if (!token) {
        console.error("Darija Translator: No API token configured");
        return;
    }

    const oppositeDirection =
        direction === "to-english" ? "to-darija" : "to-english";

    try {
        const translation = await callTranslationAPI(
            selectedText,
            token,
            oppositeDirection,
            model,
        );
        if (translation) {
            replaceSelectedText(translation);
        }
    } catch (error) {
        console.error("Translation failed:", error);
    }
};

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === "T") {
        event.preventDefault();

        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            handleSelectionTranslation(selectedText);
        }
    }
});

const initTranslator = () => {
    console.log("Darija Translator initialized");
    addClickListener();
    observeNewMessages();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTranslator);
} else {
    initTranslator();
}
