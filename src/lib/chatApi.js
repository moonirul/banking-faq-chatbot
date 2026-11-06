const DEFAULT_WEBHOOK_URL =
  'http://localhost:5678/webhook/740ae2b5-aedf-4ceb-bd7e-a29ea58b369f'

export const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || DEFAULT_WEBHOOK_URL

// Customize this function if your n8n workflow returns a different JSON structure.
export function extractAnswer(payload) {
  if (typeof payload === 'string') return payload.trim()
  if (!payload || typeof payload !== 'object') return ''

  const keys = ["output", "answer", "response", "reply", "text"];

  
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (value && typeof value === 'object') {
      const nested = extractAnswer(value)
      if (nested) return nested
    }
  }
  // n8n can return an array of items, commonly [{ output: "..." }].
  if (Array.isArray(payload) && payload.length) {
    for (const item of payload) {
      const answer = extractAnswer(item)
      if (answer) return answer
    }
  }
  return ''
}

export async function sendChatMessage(chatInput, sessionId) {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatInput, sessionId }),
  })

  if (!response.ok) {
    throw new Error(`The support service returned an error (${response.status}). Please try again.`)
  }

  const raw = await response.text()
  if (!raw.trim()) throw new Error('The support service returned an empty response.')

  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    // Accept plain-text webhook responses as well as JSON.
    payload = raw
  }

  const answer = extractAnswer(payload)
  if (!answer) {
    throw new Error('The support service response did not contain an answer. Please check your n8n response format.')
  }
  return answer
}