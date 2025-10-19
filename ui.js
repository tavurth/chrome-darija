const replaceMessageText = (textElement, originalText, translation) => {
    textElement.dataset.originalText = originalText;
    textElement.dataset.translated = "true";
    textElement.textContent = translation;
    textElement.style.fontStyle = "italic";
    textElement.style.color = "#65676b";
    textElement.title = `Original: ${originalText}`;
};

const showError = (message) => {
    console.error("Darija Translator:", message);
};
