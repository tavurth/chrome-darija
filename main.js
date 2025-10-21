// Initialization and setup
let currentUrl = location.href
let initTimeout = null

const initTranslator = () => {
  console.log('Darija Translator initialized')
  addClickListener()
  observeNewMessages()
}

const handleNavigation = () => {
  const newUrl = location.href
  if (newUrl !== currentUrl) {
    currentUrl = newUrl
    console.log('Navigation detected:', location.pathname)

    if (initTimeout) clearTimeout(initTimeout)

    initTimeout = setTimeout(initTranslator, 200)
    setTimeout(initTranslator, 800)
    setTimeout(initTranslator, 1500)
  }
}

const observeForMessengerNavigation = () => {
  const observer = new MutationObserver(() => {
    const threadId = location.pathname.split('/').pop()
    const currentThreadId = currentUrl.split('/').pop()

    if (threadId !== currentThreadId) {
      handleNavigation()
    }
  })

  const target = findMainContentArea()
  observer.observe(target, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-testid', 'aria-label'],
  })
}

// Use pushState/replaceState interception
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

history.pushState = function (...args) {
  originalPushState.apply(this, args)
  setTimeout(handleNavigation, 50)
}

history.replaceState = function (...args) {
  originalReplaceState.apply(this, args)
  setTimeout(handleNavigation, 50)
}

window.addEventListener('popstate', handleNavigation)

// Initial setup
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initTranslator()
    observeForMessengerNavigation()
  })
} else {
  initTranslator()
  observeForMessengerNavigation()
}
