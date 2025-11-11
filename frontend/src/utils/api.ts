// API Integration Module

import type { Session } from './types'
import { generateSessionId } from './helpers'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const CURRENT_SESSION_KEY = 'currentSession'

// Cache for sessions to avoid excessive API calls
let sessionsCache: Session[] | null = null

/**
 * Fetch all sessions from the API
 * @returns Promise resolving to array of sessions
 */
export async function getSessions(): Promise<Session[]> {
  const url = `${API_BASE_URL}/api/sessions`
  console.log('DEBUG: Fetching sessions from:', url)

  try {
    const response = await fetch(url)
    console.log('DEBUG: Response status:', response.status, response.statusText)

    if (!response.ok) {
      const text = await response.text()
      console.error('DEBUG: Response body:', text)
      throw new Error(`Failed to fetch sessions: ${response.status} ${response.statusText}`)
    }

    const sessions = await response.json()
    console.log('DEBUG: Got sessions:', sessions.length)
    sessionsCache = sessions
    return sessions
  } catch (error) {
    console.error('ERROR: Error fetching sessions:', error)
    if (error instanceof TypeError) {
      console.error('ERROR: Network error - is the server running?')
    }
    return sessionsCache || []
  }
}

/**
 * Get the current active session from localStorage
 * @returns Current session object or null
 */
export function getCurrentSession(): Session | null {
  const sessionId = localStorage.getItem(CURRENT_SESSION_KEY)
  if (!sessionId) return null

  // Try to find in cache
  if (sessionsCache) {
    return sessionsCache.find(s => s.id === sessionId) || null
  }

  return null
}

/**
 * Set the current active session in localStorage
 * @param sessionId Session ID to set as current, or null to clear
 */
export function setCurrentSession(sessionId: string | null): void {
  if (sessionId) {
    localStorage.setItem(CURRENT_SESSION_KEY, sessionId)
  } else {
    localStorage.removeItem(CURRENT_SESSION_KEY)
  }
}

/**
 * Create a new session via the API
 * @param request User request
 * @param repo Repository name
 * @param environment Environment name
 * @param output Session output
 * @returns Promise resolving to created session
 */
export async function createSession(
  request: string,
  repo: string,
  environment: string,
  output: string
): Promise<Session> {
  const session: Session = {
    id: generateSessionId(),
    name: `Session ${new Date().toLocaleString()}`,
    request,
    repo,
    environment,
    output,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const url = `${API_BASE_URL}/api/sessions`
  console.log('DEBUG: Creating session at:', url)
  console.log('DEBUG: Session data:', session)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    })

    console.log('DEBUG: Create response status:', response.status, response.statusText)

    if (!response.ok) {
      const text = await response.text()
      console.error('DEBUG: Response body:', text)
      throw new Error(`Failed to create session: ${response.status} ${response.statusText}`)
    }

    const createdSession = await response.json()
    console.log('DEBUG: Session created successfully:', createdSession.id)
    sessionsCache = null // Invalidate cache
    setCurrentSession(createdSession.id)

    return createdSession
  } catch (error) {
    console.error('ERROR: Error creating session:', error)
    if (error instanceof TypeError) {
      console.error('ERROR: Network error - is the server running?')
    }
    throw error
  }
}

/**
 * Update an existing session via the API
 * @param sessionId Session ID to update
 * @param updates Partial session object with fields to update
 */
export async function updateSession(sessionId: string, updates: Partial<Session>): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })

    if (!response.ok) throw new Error('Failed to update session')

    sessionsCache = null // Invalidate cache
  } catch (error) {
    console.error('Error updating session:', error)
    throw error
  }
}

/**
 * Delete a session via the API
 * @param sessionId Session ID to delete
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
      method: 'DELETE'
    })

    if (!response.ok) throw new Error('Failed to delete session')

    sessionsCache = null // Invalidate cache

    // If we deleted the current session, clear it
    if (getCurrentSession()?.id === sessionId) {
      setCurrentSession(null)
    }
  } catch (error) {
    console.error('Error deleting session:', error)
    throw error
  }
}
