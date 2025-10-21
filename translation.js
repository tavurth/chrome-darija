// Translation logic
const showLoadingAnimation = (element) => {
  let dotCount = 0
  const animation = setInterval(() => {
    dotCount = (dotCount % 3) + 1
    element.textContent = '.'.repeat(dotCount)
  }, 500)

  element.dataset.loadingInterval = animation
  return animation
}

const clearLoadingAnimation = (element) => {
  const intervalId = element.dataset.loadingInterval
  if (intervalId) {
    clearInterval(intervalId)
    delete element.dataset.loadingInterval
  }
}

const replaceMessageText = (textElement, originalText, translation) => {
  if (translation === originalText) return

  textElement.dataset.originalText = originalText
  textElement.dataset.translated = 'true'
  textElement.textContent = translation
}

const translateMessage = async (textElement, originalText) => {
  const { token, direction, model } = await getStoredSettings()
  if (!token) {
    console.error('Darija Translator: No API token configured')
    return
  }

  const loadingInterval = showLoadingAnimation(textElement)

  try {
    const translation = await callTranslationAPI(originalText, token, direction, model)
    clearLoadingAnimation(textElement)

    if (translation) {
      replaceMessageText(textElement, originalText, translation)
    } else {
      textElement.textContent = originalText
    }
  } catch (error) {
    clearLoadingAnimation(textElement)
    console.error('Translation failed:', error)
    textElement.textContent = originalText
  }
}

const replaceSelectedText = (translation) => {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()

    document.execCommand('insertText', false, translation)

    const target =
      range.commonAncestorContainer.parentElement || range.commonAncestorContainer
    if (target && target.dispatchEvent) {
      target.dispatchEvent(new Event('input', { bubbles: true }))
      target.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }
}

const handleSelectionTranslation = async (selectedText) => {
  const { token, direction, model } = await getStoredSettings()
  if (!token) {
    console.error('Darija Translator: No API token configured')
    return
  }

  const oppositeDirection = direction === 'to-english' ? 'to-darija' : 'to-english'

  try {
    const translation = await callTranslationAPI(
      selectedText,
      token,
      oppositeDirection,
      model,
    )
    if (translation) {
      replaceSelectedText(translation)
    }
  } catch (error) {
    console.error('Translation failed:', error)
  }
}
