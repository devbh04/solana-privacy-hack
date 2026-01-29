// Content script - injects privacy payment cards into Twitter/X
import './content.css'

// URL patterns for privacy payment blinks
const BLINK_URL_PATTERNS = [
  /https?:\/\/(?:www\.)?localhost:\d+\/private-payments\/pay\?[^\s"<>]*/,
  /https?:\/\/(?:www\.)?solana-privacy-hack\.vercel\.app\/private-payments\/pay\?[^\s"<>]*/,
  /https?:\/\/(?:www\.)?privacy\.cash\/private-payments\/pay\?[^\s"<>]*/,
]

// Detect API base URL from matched blink URL
function getApiBaseUrl(blinkUrl: string): string {
  if (blinkUrl.includes('localhost')) {
    return 'http://localhost:3000'
  }
  return 'https://solana-privacy-hack.vercel.app'
}

const processedElements = new WeakSet<Element>()
const pendingRequests: Record<string, { resolve: (data: any) => void; reject: (error: Error) => void }> = {}
let requestCounter = 0

interface WalletState {
  connected: boolean
  address: string | null
}

let walletState: WalletState = { connected: false, address: null }

// Inject wallet bridge script
function injectWalletBridge() {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('src/content/injected.js')
  script.onload = () => script.remove()
    ; (document.head || document.documentElement).appendChild(script)
  console.log('Privacy Blinks: Wallet bridge injected')
}

// Listen for wallet responses
window.addEventListener('privacy-wallet-response', ((event: CustomEvent) => {
  const { requestId, success, data, error } = event.detail
  const pending = pendingRequests[requestId]
  if (pending) {
    if (success) {
      pending.resolve(data)
    } else {
      pending.reject(new Error(error))
    }
    delete pendingRequests[requestId]
  }
}) as EventListener)

// Send wallet action
function sendWalletAction(action: string, data: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestId = `req_${++requestCounter}`
    pendingRequests[requestId] = { resolve, reject }

    window.dispatchEvent(
      new CustomEvent('privacy-wallet-action', {
        detail: { action, data, requestId },
      })
    )

    setTimeout(() => {
      if (pendingRequests[requestId]) {
        delete pendingRequests[requestId]
        reject(new Error('Wallet action timed out'))
      }
    }, 60000)
  })
}

// Extract blink info from URL
function extractBlinkInfo(text: string): { amount: string; linkId: string; fullUrl: string } | null {
  for (const pattern of BLINK_URL_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const url = new URL(match[0])
      const amount = url.searchParams.get('amount')
      const linkId = url.searchParams.get('id')
      if (amount && linkId) {
        return { amount, linkId, fullUrl: match[0] }
      }
    }
  }
  return null
}

// Fetch blink card data
async function fetchBlinkData(linkId: string, fullUrl: string) {
  try {
    const apiBase = getApiBaseUrl(fullUrl)
    const response = await fetch(`${apiBase}/api/blink/${linkId}`)
    if (!response.ok) throw new Error('Failed to fetch blink')
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Privacy Blinks: Error fetching blink data', error)
    return null
  }
}

// Escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text || ''
  return div.innerHTML
}

// Truncate address
function truncateAddress(address: string): string {
  if (!address) return 'Unknown'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Get type emoji
function getTypeEmoji(cardType: string): string {
  switch (cardType) {
    case 'tip': return '💰'
    case 'donation': return '❤️'
    case 'payment': return '💳'
    default: return '✨'
  }
}

// Create blink card
function createBlinkCard(blinkData: any, amount: string, payUrl: string): HTMLElement {
  const container = document.createElement('div')
  container.className = 'privacy-card-container'

  const {
    cardTitle,
    cardDescription,
    cardType,
    primaryColor = '#7C3AED',
    secondaryColor = '#14F195',
    textColor = '#FFFFFF',
    requestedAmount,
  } = blinkData

  const displayAmount = amount || requestedAmount || '0'
  const usdValue = (parseFloat(displayAmount) * 150).toFixed(2)
  const typeLabel = cardType ? cardType.charAt(0).toUpperCase() + cardType.slice(1) : 'Payment'

  container.innerHTML = `
    <div class="privacy-card" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, ${secondaryColor}44 100%);">
      <!-- Animated blobs -->
      <div class="privacy-blob privacy-blob-1" style="background-color: ${secondaryColor};"></div>
      <div class="privacy-blob privacy-blob-2" style="background-color: ${primaryColor};"></div>
      
      <div class="privacy-card-content">
        <!-- Header -->
        <div class="privacy-header">
          <div class="privacy-badge" style="background-color: ${textColor}22; border-color: ${textColor}44; color: ${textColor};">
            ${getTypeEmoji(cardType)} ${typeLabel}
          </div>
          <div class="privacy-icon" style="background-color: ${textColor}22;">⚡</div>
        </div>
        
        <!-- Title & Description -->
        <div class="privacy-info">
          <h2 class="privacy-title" style="color: ${textColor};">${escapeHtml(cardTitle)}</h2>
          <p class="privacy-desc" style="color: ${textColor};">${escapeHtml(cardDescription)}</p>
        </div>
        
        <!-- Amount Section -->
        <div class="privacy-amount-box" style="background-color: ${textColor}11; border-color: ${textColor}33;">
          <p class="privacy-amount-label" style="color: ${textColor};">AMOUNT</p>
          <div class="privacy-amount-value">
            <span class="privacy-amount" style="color: ${textColor}; text-shadow: 0 0 20px ${secondaryColor}88;">${displayAmount}</span>
            <span class="privacy-sol" style="color: ${textColor};">SOL</span>
          </div>
          <p class="privacy-usd" style="color: ${textColor};">≈ $${usdValue} USD</p>
        </div>
        
        <!-- Wallet Section -->
        <div class="privacy-wallet-section" id="wallet-section">
          ${!walletState.connected ? `
            <button class="privacy-btn privacy-btn-connect" data-action="connect">
              🔗 Connect Solana Wallet
            </button>
          ` : `
            <div class="privacy-connected-info">
              <div class="privacy-connected-header">
                <span class="privacy-connected-label">✓ Wallet Connected</span>
                <button class="privacy-btn-disconnect" data-action="disconnect">Disconnect</button>
              </div>
              <div class="privacy-wallet-address">
                <span class="privacy-dot"></span>
                <span>${truncateAddress(walletState.address || '')}</span>
              </div>
            </div>
            <a href="${payUrl}" target="_blank" rel="noopener" class="privacy-btn privacy-btn-pay">
              🔒 Pay Privately
            </a>
          `}
        </div>
        
        <!-- Footer -->
        <div class="privacy-footer" style="color: ${textColor};">
          POWERED BY Privacy Cash
        </div>
      </div>
    </div>
  `

  // Attach event listeners
  attachEventListeners(container, payUrl)

  return container
}

// Attach event listeners
function attachEventListeners(container: HTMLElement, payUrl: string) {
  // Connect button
  const connectBtn = container.querySelector('[data-action="connect"]')
  connectBtn?.addEventListener('click', () => handleConnectWallet(container, payUrl))

  // Disconnect button
  const disconnectBtn = container.querySelector('[data-action="disconnect"]')
  disconnectBtn?.addEventListener('click', () => handleDisconnectWallet(container, payUrl))
}

// Rebuild wallet section
function rebuildWalletSection(container: HTMLElement, payUrl: string) {
  const walletSection = container.querySelector('#wallet-section')
  if (!walletSection) return

  if (!walletState.connected) {
    walletSection.innerHTML = `
          <button class="privacy-btn privacy-btn-connect" data-action="connect">
            🔗 Connect Solana Wallet
          </button>
        `
  } else {
    walletSection.innerHTML = `
          <div class="privacy-connected-info">
            <div class="privacy-connected-header">
              <span class="privacy-connected-label">✓ Wallet Connected</span>
              <button class="privacy-btn-disconnect" data-action="disconnect">Disconnect</button>
            </div>
            <div class="privacy-wallet-address">
              <span class="privacy-dot"></span>
              <span>${truncateAddress(walletState.address || '')}</span>
            </div>
          </div>
          <a href="${payUrl}" target="_blank" rel="noopener" class="privacy-btn privacy-btn-pay">
            🔒 Pay Privately
          </a>
        `
  }

  // Re-attach listeners
  attachEventListeners(container, payUrl)
}

// Handle connect wallet
async function handleConnectWallet(container: HTMLElement, payUrl: string) {
  try {
    const result = await sendWalletAction('connect')
    walletState = {
      connected: result.connected,
      address: result.address,
    }
    rebuildWalletSection(container, payUrl)
  } catch (error: any) {
    console.error('Privacy Blinks: Connect error', error)
    alert(error.message || 'Failed to connect wallet')
  }
}

// Handle disconnect wallet
function handleDisconnectWallet(container: HTMLElement, payUrl: string) {
  walletState = { connected: false, address: null }
  rebuildWalletSection(container, payUrl)
}

// Process blink links
async function processBlinkLinks() {
  console.log('Privacy Blinks: Scanning for links...')

  // Check anchor tags
  const links = document.querySelectorAll('a')
  for (const link of links) {
    if (processedElements.has(link)) continue

    const blinkInfo = extractBlinkInfo(link.href || '') || extractBlinkInfo(link.textContent || '')
    if (!blinkInfo) continue

    console.log('Privacy Blinks: Found link', blinkInfo.linkId)
    processedElements.add(link)
    await injectCard(link, blinkInfo)
  }

  // Check tweet text
  const tweetTexts = document.querySelectorAll('[data-testid="tweetText"], article div[lang]')
  for (const tweetText of tweetTexts) {
    if (processedElements.has(tweetText)) continue

    const blinkInfo = extractBlinkInfo(tweetText.textContent || '')
    if (!blinkInfo) continue

    const parentTweet = tweetText.closest('article')
    if (parentTweet?.querySelector('.privacy-card-container')) continue

    console.log('Privacy Blinks: Found in text', blinkInfo.linkId)
    processedElements.add(tweetText)
    await injectCard(tweetText as HTMLElement, blinkInfo)
  }
}

// Inject card
async function injectCard(element: Element, blinkInfo: { amount: string; linkId: string; fullUrl: string }) {
  const blinkData = await fetchBlinkData(blinkInfo.linkId, blinkInfo.fullUrl)

  // Create fallback data if API fails
  const cardData = blinkData || {
    cardTitle: 'Private Payment Request',
    cardDescription: 'Send SOL privately using zero-knowledge proofs',
    cardType: 'payment',
    primaryColor: '#7C3AED',
    secondaryColor: '#14F195',
    textColor: '#FFFFFF',
    requestedAmount: blinkInfo.amount,
  }

  console.log('Privacy Blinks: Rendering card for', blinkInfo.linkId)

  const container =
    element.closest('[data-testid="tweet"]') ||
    element.closest('article') ||
    element.closest('[data-testid="tweetText"]') ||
    element.parentElement

  if (container && !container.querySelector('.privacy-card-container')) {
    const card = createBlinkCard(cardData, blinkInfo.amount, blinkInfo.fullUrl)
    const insertPoint = element.closest('[data-testid="tweetText"]') || element
    insertPoint.parentNode?.insertBefore(card, insertPoint.nextSibling)
    console.log('Privacy Blinks: Card injected')
  }
}

// Initialize
async function init() {
  console.log('Privacy Blinks: Extension initialized on', window.location.hostname)

  injectWalletBridge()
  await new Promise(r => setTimeout(r, 500))

  await processBlinkLinks()

  // Watch for new content
  const observer = new MutationObserver(mutations => {
    if (mutations.some(m => m.addedNodes.length > 0)) {
      setTimeout(processBlinkLinks, 500)
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
