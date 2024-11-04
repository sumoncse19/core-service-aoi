/**
 * Generates a random confirmation code
 * Format: XXXX-XXXX-XXXX (X can be A-Z or 0-9)
 */
export const generateConfirmationCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments = 3
  const segmentLength = 4

  const generateSegment = () => {
    return Array.from(
      { length: segmentLength },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('')
  }

  return Array.from({ length: segments }, generateSegment).join('-')
}
