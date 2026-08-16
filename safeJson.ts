export function safeParseJson<T>(value: unknown, fallback: T): T {
  if (value == null || value === '') return fallback;
  if (typeof value !== 'string') return value as T;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Invalid JSON content encountered; using fallback.', error);
    return fallback;
  }
}
