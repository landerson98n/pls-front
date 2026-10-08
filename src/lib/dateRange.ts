export function parseRangeParam(value: string, endOfDay = false): Date | null {
    const raw = decodeURIComponent(value || '')
    const iso = raw.includes('_') ? raw.split('_').reverse().join('-') : raw.slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
    const date = new Date(`${iso}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`)
    return Number.isNaN(date.getTime()) ? null : date
}
