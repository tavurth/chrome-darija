const loadSavedToken = async () => {
    const { openrouterToken } =
        await chrome.storage.local.get("openrouterToken");
    if (openrouterToken) {
        document.getElementById("tokenInput").value = openrouterToken;
        updateStatus("Token loaded");
    }
};

const saveToken = async () => {
    const token = document.getElementById("tokenInput").value.trim();
    if (!token) {
        updateStatus("Please enter a token", "error");
        return;
    }

    if (!token.startsWith("sk-or-v1-")) {
        updateStatus("Invalid OpenRouter token format", "error");
        return;
    }

    await chrome.storage.local.set({ openrouterToken: token });
    updateStatus("Token saved successfully!");
};

const updateStatus = (message, type = "success") => {
    const status = document.getElementById("status");
    status.textContent = message;
    status.style.color = type === "error" ? "#e74c3c" : "#27ae60";
};

document.getElementById("saveButton").addEventListener("click", saveToken);
document.addEventListener("DOMContentLoaded", loadSavedToken);
