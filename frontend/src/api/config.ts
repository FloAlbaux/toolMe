const API_BASE =import.meta.env?.VITE_API_URL ??  'http://localhost:8030'

export function getApiBaseUrl(): string {
  return API_BASE.replace(/\/$/, '')
}
