// Helper Utility Functions

/**
 * Generate a random session ID
 * @returns A 12-character uppercase alphanumeric string
 */
export function generateSessionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let id = ''
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}

/**
 * Format a date for display
 * @param dateStr ISO date string
 * @returns Formatted date and time string
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Generate mock output for session creation
 * @param request User request
 * @param repo Repository name
 * @param environment Environment name
 * @returns Mock output string
 */
export function generateMockOutput(request: string, repo: string, environment: string): string {
  const mockPhrases = [
    'Initializing session workspace...',
    'Connecting to GitHub repository...',
    'Setting up environment configuration...',
    'Installing dependencies...',
    'Running build scripts...',
    'Configuring deployment settings...',
    'Starting development server...',
    'Generating session credentials...',
    'Allocating compute resources...',
    'Establishing secure connection...',
    'Session created successfully!',
    'Your workspace is ready to use.',
    'Navigate to the dashboard to view details.',
  ]

  // Randomly select 5-8 phrases
  const numPhrases = Math.floor(Math.random() * 4) + 5
  const selectedPhrases: string[] = []
  const usedIndices = new Set<number>()

  while (selectedPhrases.length < numPhrases) {
    const index = Math.floor(Math.random() * mockPhrases.length)
    if (!usedIndices.has(index)) {
      usedIndices.add(index)
      selectedPhrases.push(mockPhrases[index])
    }
  }

  return `
Request: ${request}

Repository: ${repo}
Environment: ${environment}

Processing...

${selectedPhrases.join('\n')}

Session ID: ${generateSessionId()}
  `.trim()
}
