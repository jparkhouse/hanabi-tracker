export function getBaseURL(): string {
    switch (import.meta.env.BASE_URL) {
    case '/hanabi-tracker':
      return '/hanabi-tracker'
    case '/hanabi-tracker/test':
      return '/hanabi-tracker/test'
    case '/dev':
      return '/dev'
    default:
      return '/unknown'
  };
}
