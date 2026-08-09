/**
 * Shared couple greeting: "Buenos días, Xiomara e Iván 👋".
 * Uses "e" instead of "y" before names starting with i/hi (Spanish rule).
 */

export function buildGreeting(names: string[]): string {
  const hour = new Date().getHours()
  const part = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  if (names.length >= 2) {
    const [first, second] = names
    const conj = second?.match(/^(i|hi)/i) ? 'e' : 'y'
    return `${part}, ${first} ${conj} ${second} 👋`
  }
  if (names.length === 1) {
    return `${part}, ${names[0]} 👋`
  }
  return `${part} 👋`
}
