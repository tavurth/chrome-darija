// UI event handling
const handleMessageClick = async (event) => {
  const messageElement = findMessageElement(event.target)
  if (!messageElement) return

  const textElement = findTextElement(messageElement)
  if (!textElement) return

  if (textElement.dataset.translated === 'true') {
    textElement.textContent = textElement.dataset.originalText
    textElement.dataset.translated = 'false'
    return
  }

  const originalText = textElement.textContent?.trim()
  if (!originalText) return

  await translateMessage(textElement, originalText)
}

const addClickListener = () => {
  if (!hasVisibleMessages()) return

  const containers = findDMContainers()
  if (!containers.length) {
    console.error('DM container not found')
    return
  }

  containers.forEach((container) => {
    container.removeEventListener('click', handleMessageClick)
    container.addEventListener('click', handleMessageClick)
  })
}

const observeNewMessages = () => {
  let debounceTimer

  const checkAndAddListeners = () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      addClickListener()
    }, 300)
  }

  const observer = new MutationObserver(checkAndAddListeners)
  const handleScroll = () => checkAndAddListeners()

  const containers = findDMContainers()
  containers.forEach((container) => {
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: false,
    })

    container.addEventListener('scroll', handleScroll, { passive: true })
  })

  window.addEventListener('scroll', handleScroll, { passive: true })
}

// Keyboard shortcut handler
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.shiftKey && event.key === 'T') {
    event.preventDefault()

    const selectedText = window.getSelection().toString().trim()
    if (selectedText) {
      handleSelectionTranslation(selectedText)
    }
  }
})
