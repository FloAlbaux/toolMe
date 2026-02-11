/** Same pattern as backend: local@domain.tld */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}

export const logger = {
  info: (message: string) => {
    console.info(`[INFO] ${message}`)
  },
  error: (message: string, error: Error) => {
    console.error(`[ERROR] ${message}`, error)
  },
  warn: (message: string) => {
    console.warn(`[WARN] ${message}`)
  },
  debug: (message: string) => {
    console.debug(`[DEBUG] ${message}`)
  },
}