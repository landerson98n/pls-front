export function toDateKey(value?: string | Date | null): string {
    if (!value) return ''
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function isWithinRange(value: string | Date | null | undefined, start: string, end: string) {
    const day = toDateKey(value)
    if (!day || !start || !end) return false
    return day >= start && day <= end
}

export function toPathDate(value?: string | Date | null): string {
    const key = toDateKey(value)
    if (!key) return ''
    const [year, month, day] = key.split('-')
    return `${day}_${month}_${year}`
}
