const loadSavedSettings = async () => {
  const { openrouterToken, translationDirection, selectedModel } =
    await chrome.storage.local.get([
      'openrouterToken',
      'translationDirection',
      'selectedModel',
    ])

  if (openrouterToken) {
    document.getElementById('tokenInput').value = openrouterToken
  }

  document.getElementById('translationDirection').value =
    translationDirection || 'to-english'

  document.getElementById('modelSelect').value =
    selectedModel || 'deepseek/deepseek-chat-v3.1:free'

  if (openrouterToken) updateStatus('Settings loaded')
}

const saveSettings = async () => {
  const token = document.getElementById('tokenInput').value.trim()
  const direction = document.getElementById('translationDirection').value
  const model = document.getElementById('modelSelect').value

  if (!token) {
    updateStatus('Please enter a token', 'error')
    return
  }

  if (!token.startsWith('sk-or-v1-')) {
    updateStatus('Invalid OpenRouter token format', 'error')
    return
  }

  await chrome.storage.local.set({
    openrouterToken: token,
    translationDirection: direction,
    selectedModel: model,
  })
  updateStatus('Settings saved successfully!')
}

const updateStatus = (message, type = 'success') => {
  const status = document.getElementById('status')
  status.textContent = message
  status.style.color = type === 'error' ? '#e74c3c' : '#27ae60'
}

document.getElementById('saveButton').addEventListener('click', saveSettings)
document.addEventListener('DOMContentLoaded', loadSavedSettings)
