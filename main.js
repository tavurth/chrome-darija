// Initialization and setup
let currentUrl = location.href;
let initTimeout = null;

const initTranslator = () => {
    console.log("Darija Translator initialized");
    addClickListener(); // Add listeners if messages are already visible
    observeNewMessages(); // And start observing for future changes
};

const handleNavigation = () => {
    const newUrl = location.href;
    if (newUrl !== currentUrl) {
        currentUrl = newUrl;
        console.log("Navigation detected:", location.pathname);

        // Clear any pending initialization
        if (initTimeout) clearTimeout(initTimeout);

        // Multiple attempts with increasing delays for async content
        initTimeout = setTimeout(initTranslator, 200);
        setTimeout(initTranslator, 800);
        setTimeout(initTranslator, 1500);
    }
};

// Enhanced navigation detection for Messenger
const observeForMessengerNavigation = () => {
    // Watch for specific Messenger DOM changes that indicate new conversation
    const observer = new MutationObserver(() => {
        // Check if we're on a different conversation thread
        const threadId = location.pathname.split("/").pop();
        const currentThreadId = currentUrl.split("/").pop();

        if (threadId !== currentThreadId) {
            handleNavigation();
        }
    });

    // Watch the main content area
    const target = document.querySelector('[role="main"]') || document.body;
    observer.observe(target, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-testid", "aria-label"],
    });
};

// Use pushState/replaceState interception
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function (...args) {
    originalPushState.apply(this, args);
    setTimeout(handleNavigation, 50);
};

history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    setTimeout(handleNavigation, 50);
};

window.addEventListener("popstate", handleNavigation);

// Initial setup
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initTranslator();
        observeForMessengerNavigation();
    });
} else {
    initTranslator();
    observeForMessengerNavigation();
}
