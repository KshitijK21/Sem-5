export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US')

export const fmtMoney = (n: number) =>
  `R$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const fmtMoneyShort = (n: number) =>
  `R$ ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`

export function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
}
