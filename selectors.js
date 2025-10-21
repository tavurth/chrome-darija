// DOM element finding utilities - structure-based approach
const findMessageElement = (target) => {
  // Only use truly stable selectors
  const stableSelectors = [
    '[role="button"][aria-label*="tap"]',
    '[aria-label*="message"]',
    '[data-testid*="message"]',
    '[data-id]', // WhatsApp uses data-id for messages
  ]

  for (const selector of stableSelectors) {
    const element = target.closest(selector)
    if (element) return element
  }

  // Traverse up looking for message-like containers
  let current = target
  while (current && current !== document.body) {
    if (looksLikeMessage(current)) return current
    current = current.parentElement
  }

  return null
}

const isWhiteText = (element) => {
  if (!element) return false

  const style = window.getComputedStyle(element)
  const color = style.color

  // Parse rgb(r, g, b) format
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!rgbMatch) return false

  const [, r, g, b] = rgbMatch.map(Number)
  return r > 240 && g > 240 && b > 240
}

const findTextElement = (messageElement) => {
  const directionalText = messageElement.querySelector('[dir="ltr"], [dir="auto"]')
  if (directionalText?.textContent?.trim() && isWhiteText(directionalText)) {
    const text = directionalText.textContent.trim()
    if (text.length > 10) return directionalText

    const textChild = directionalText.querySelector('span, div')
    if (textChild?.textContent?.trim() && isWhiteText(textChild)) return textChild
  }

  const walker = document.createTreeWalker(
    messageElement,
    NodeFilter.SHOW_TEXT,
    (node) => {
      const hasText = node.textContent.trim().length > 5
      const parentIsWhite = isWhiteText(node.parentElement)
      return hasText && parentIsWhite && !isTimeOrMetadata(node.textContent)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP
    },
  )

  let longestText = null
  let maxLength = 0
  let node

  while ((node = walker.nextNode())) {
    if (node.textContent.length > maxLength) {
      maxLength = node.textContent.length
      longestText = node.parentElement
    }
  }

  return longestText
}

const findDMContainers = () => {
  // Look for stable container patterns across platforms
  const containerSelectors = [
    '[role="main"]', // Common main content area
    '[data-testid*="conversation"]', // Messenger/Instagram
    '[data-id]', // WhatsApp message containers
    'main', // HTML5 semantic main
  ]

  const containers = []
  for (const selector of containerSelectors) {
    containers.push(...document.querySelectorAll(selector))
  }

  // Fallback: find containers with message-like content
  if (!containers.length) {
    const candidates = document.querySelectorAll('div')
    for (const candidate of candidates) {
      if (hasMessageContent(candidate)) {
        containers.push(candidate)
      }
    }
  }

  return [...new Set(containers)] // Remove duplicates
}

const hasMessageContent = (container) => {
  // Look for directional text (common in messaging apps)
  const hasDirectionalText = container.querySelector('[dir="auto"], [dir="ltr"]')
  if (!hasDirectionalText) return false

  // Must have reasonable text content
  const textContent = container.textContent?.trim()
  if (!textContent || textContent.length < 10) return false

  // Look for interactive elements or message structure
  const hasInteractivity = container.querySelector(
    '[role="button"], [tabindex], [aria-label]',
  )
  return !!hasInteractivity
}

const hasVisibleMessages = () => {
  const containers = findDMContainers()
  return containers.some((container) => {
    const directionalElements = container.querySelectorAll('[dir="auto"], [dir="ltr"]')
    return Array.from(directionalElements).some((el) => {
      const text = el.textContent?.trim()
      return text && text.length > 5 && el.getBoundingClientRect().height > 0
    })
  })
}

const looksLikeMessage = (element) => {
  if (!element.textContent?.trim() || element.textContent.length < 3) return false

  // Check for interactive attributes (stable indicators)
  const hasInteractiveAttrs =
    element.getAttribute('role') === 'button' ||
    element.hasAttribute('tabindex') ||
    element.hasAttribute('aria-label')

  // Check for text directionality (common in messaging)
  const hasDirectionalText = element.querySelector('[dir]') !== null

  // Check structural depth (messages have nested content)
  const depth = getElementDepth(element)
  const hasReasonableDepth = depth >= 3 && depth <= 8

  // Must have some combination of these stable indicators
  return (hasInteractiveAttrs || hasDirectionalText) && hasReasonableDepth
}

const isTimeOrMetadata = (text) => {
  const trimmed = text.trim()

  // Time patterns
  if (/^\d{1,2}:\d{2}/.test(trimmed)) return true

  // Very short text likely metadata
  if (trimmed.length < 3) return true

  // Common metadata words
  const metadataPatterns = /^(read|delivered|sent|online|offline|typing)$/i
  return metadataPatterns.test(trimmed)
}

const findMainContentArea = () => {
  const candidates = [
    document.querySelector('[role="main"]'),
    document.querySelector('main'),
    document.querySelector('[data-testid*="conversation"]'),
    document.querySelector('[data-testid*="chat"]'),
  ].filter(Boolean)

  return candidates[0] || document.body
}

const getElementDepth = (element) => {
  if (!element.children.length) return 1
  return 1 + Math.max(...Array.from(element.children).map(getElementDepth))
}
