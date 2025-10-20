// DOM element finding utilities
const findMessageElement = (target) => {
    // Try multiple selector strategies
    const selectors = [
        '[role="button"][aria-label*="tap"]', // Instagram
        '[data-scope="messages_table"] div', // Facebook
        ".x1lliihq", // Facebook message wrapper
        '[role="presentation"]', // Facebook container
        ".html-div", // Your new examples
    ];

    for (const selector of selectors) {
        const element = target.closest(selector);
        if (element) return element;
    }

    // Fallback: traverse up to find clickable container
    let current = target;
    while (current && current !== document.body) {
        const role = current.getAttribute?.("role");
        const hasValidClasses =
            current.classList?.contains("x1lliihq") ||
            current.classList?.contains("html-div");

        if (role === "button" || role === "presentation" || hasValidClasses) {
            return current;
        }
        current = current.parentElement;
    }

    return null;
};

const findTextElement = (messageElement) => {
    // Try specific selectors first - updated for your examples
    const textSelectors = [
        'div[dir="auto"]', // Instagram
        '.x1lliihq span[dir="auto"] div', // Facebook/Messenger
        '[data-scope="messages_table"] div[dir="auto"]',
        '.html-div[dir="auto"]', // Your examples
        'div.html-div[dir="auto"]', // More specific for your case
    ];

    for (const selector of textSelectors) {
        const element = messageElement.querySelector(selector);
        if (element?.textContent?.trim()) return element;
    }

    // Direct match if the messageElement itself is the text container
    if (
        messageElement.getAttribute?.("dir") === "auto" &&
        messageElement.textContent?.trim()
    ) {
        return messageElement;
    }

    // Fallback: find any div with dir="auto" and text content
    const divs = messageElement.querySelectorAll('div[dir="auto"]');
    return Array.from(divs).find((div) => div.textContent?.trim());
};
