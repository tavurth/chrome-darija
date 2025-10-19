const SELECTORS = {
    dmContainer: '[role="main"]',
    messageText: 'div[dir="auto"]',
    messageElement: '[role="button"][aria-label*="tap"]',
};

const isDMPage = () => window.location.pathname.includes("/direct/");

const findMessageElement = (target) => {
    return target.closest(SELECTORS.messageElement);
};

const getStoredSettings = async () => {
    const { openrouterToken, translationDirection } =
        await chrome.storage.local.get([
            "openrouterToken",
            "translationDirection",
        ]);
    return {
        token: openrouterToken,
        direction: translationDirection || "to-english",
    };
};

const callTranslationAPI = async (text, token, direction = "to-english") => {
    const prompt =
        direction === "to-darija"
            ? `Translate to latin Darija (Moroccan Arabic without arabic script): "${text}"`
            : `Translate to English: "${text}"`;

    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                max_tokens: 50,
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "translation_result",
                        strict: true,
                        schema: {
                            type: "object",
                            properties: {
                                translation: {
                                    type: "string",
                                    description:
                                        "The translation of the input text",
                                },
                            },
                            required: ["translation"],
                            additionalProperties: false,
                        },
                    },
                },
            }),
        },
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const result = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    return result.translation;
};

const replaceMessageText = (textElement, originalText, translation) => {
    if (translation === originalText) return;

    textElement.dataset.originalText = originalText;
    textElement.dataset.translated = "true";
    textElement.textContent = translation;
};

const translateMessage = async (textElement, originalText) => {
    const { token, direction } = await getStoredSettings();
    if (!token) {
        console.error("Darija Translator: No API token configured");
        return;
    }

    textElement.textContent = "...";

    try {
        const translation = await callTranslationAPI(
            originalText,
            token,
            direction,
        );
        if (translation) {
            replaceMessageText(textElement, originalText, translation);
        } else {
            textElement.textContent = originalText;
        }
    } catch (error) {
        console.error("Translation failed:", error);
        textElement.textContent = originalText;
    }
};

const handleMessageClick = async (event) => {
    const messageElement = findMessageElement(event.target);
    if (!messageElement) return;

    const textElement = messageElement.querySelector(SELECTORS.messageText);
    if (!textElement) return;

    // Toggle back to original if already translated
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
    const container = document.querySelector(SELECTORS.dmContainer);
    if (!container) {
        console.log("DM container not found");
        return;
    }

    // Remove existing listener to avoid duplicates
    container.removeEventListener("click", handleMessageClick);
    container.addEventListener("click", handleMessageClick);
};

const observeNewMessages = () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (
                mutation.type === "childList" &&
                mutation.addedNodes.length > 0
            ) {
                // Check if new messages were added
                const hasNewMessages = Array.from(mutation.addedNodes).some(
                    (node) =>
                        node.nodeType === Node.ELEMENT_NODE &&
                        (node.matches?.(SELECTORS.messageElement) ||
                            node.querySelector?.(SELECTORS.messageElement)),
                );

                if (hasNewMessages) {
                    console.log(
                        "New messages detected, re-adding click listeners",
                    );
                    addClickListener();
                }
            }
        });
    });

    const container = document.querySelector(SELECTORS.dmContainer);
    if (container) {
        observer.observe(container, {
            childList: true,
            subtree: true,
        });
    }
};

const initTranslator = () => {
    if (!isDMPage()) {
        console.log("Not on DM page");
        return;
    }

    console.log("Darija Translator initialized");
    addClickListener();
    observeNewMessages();
};

// Initialize
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTranslator);
} else {
    initTranslator();
}
