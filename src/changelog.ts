import changelogRaw from '../CHANGELOG.md?raw'

export const APP_VERSION = __APP_VERSION__

const LAST_SEEN_KEY = 'shrimper-last-seen-version'

export function markVersionSeen(): void {
  localStorage.setItem(LAST_SEEN_KEY, APP_VERSION)
}

export function hasSeenCurrentVersion(): boolean {
  return localStorage.getItem(LAST_SEEN_KEY) === APP_VERSION
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderInline(s: string): string {
  // Order matters: escape first, then re-introduce known-safe markup.
  let out = escapeHtml(s)
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
    const safeUrl = /^https?:\/\//.test(url) ? url : '#'
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`
  })
  return out
}

function renderMarkdown(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []
  let inList = false
  const closeList = () => {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }

  for (const line of lines) {
    if (/^# /.test(line)) {
      closeList()
      out.push(`<h2>${renderInline(line.slice(2))}</h2>`)
    } else if (/^## /.test(line)) {
      closeList()
      out.push(`<h3>${renderInline(line.slice(3))}</h3>`)
    } else if (/^### /.test(line)) {
      closeList()
      out.push(`<h4>${renderInline(line.slice(4))}</h4>`)
    } else if (/^- /.test(line)) {
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${renderInline(line.slice(2))}</li>`)
    } else if (line.trim() === '') {
      closeList()
    } else if (/^\[.+\]:\s*\S+/.test(line)) {
      // skip reference-style link definitions
      closeList()
    } else {
      closeList()
      out.push(`<p>${renderInline(line)}</p>`)
    }
  }
  closeList()
  return out.join('\n')
}

export function renderChangelogModal(onClose?: () => void): void {
  const existing = document.getElementById('changelog-modal')
  if (existing) existing.remove()

  const modal = document.createElement('div')
  modal.id = 'changelog-modal'
  modal.className = 'overlay'
  modal.innerHTML = `
    <div class="overlay-content changelog-content">
      <div class="changelog-body">${renderMarkdown(changelogRaw)}</div>
      <div class="overlay-actions">
        <button class="btn btn-primary" id="btn-close-changelog">Got it</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)
  requestAnimationFrame(() => modal.classList.add('visible'))

  const close = () => {
    modal.classList.remove('visible')
    setTimeout(() => {
      modal.remove()
      onClose?.()
    }, 300)
  }

  modal.querySelector('#btn-close-changelog')?.addEventListener('click', close)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close()
  })
}
