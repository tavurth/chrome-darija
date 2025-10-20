// UI event handling
const handleMessageClick = async (event) => {
    const messageElement = findMessageElement(event.target);
    if (!messageElement) return;

    const textElement = findTextElement(messageElement);
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

const hasVisibleMessages = () => {
    const containers = document.querySelectorAll(CONFIG.selectors.dmContainer);
    return Array.from(containers).some((container) => {
        const messages = container.querySelectorAll('div[dir="auto"]');
        return Array.from(messages).some(
            (msg) =>
                msg.textContent?.trim() &&
                msg.getBoundingClientRect().height > 0,
        );
    });
};

const addClickListener = () => {
    if (!hasVisibleMessages()) return;

    const containers = document.querySelectorAll(CONFIG.selectors.dmContainer);
    if (!containers.length) {
        console.error("DM container not found");
        return;
    }

    containers.forEach((container) => {
        container.removeEventListener("click", handleMessageClick);
        container.addEventListener("click", handleMessageClick);
    });
};

const observeNewMessages = () => {
    let debounceTimer;

    const checkAndAddListeners = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            addClickListener(); // Only adds if messages are visible
        }, CONFIG.debounceMs);
    };

    // Watch for new DOM nodes
    const observer = new MutationObserver(checkAndAddListeners);

    // Also watch for scroll events (messages becoming visible)
    const handleScroll = () => checkAndAddListeners();

    const containers = document.querySelectorAll(CONFIG.selectors.dmContainer);
    containers.forEach((container) => {
        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: false,
        });

        // Add scroll listener to each container
        container.addEventListener("scroll", handleScroll, { passive: true });
    });

    // Also listen to window scroll in case messages are in viewport
    window.addEventListener("scroll", handleScroll, { passive: true });
};

// Keyboard shortcut handler
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === "T") {
        event.preventDefault();

        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            handleSelectionTranslation(selectedText);
        }
    }
});
