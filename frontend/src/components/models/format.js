export const fmtInt = (n) => Math.round(n).toLocaleString('en-US');
export const fmtMoney = (n) => `R$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fmtMoneyShort = (n) => `R$ ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
export const fmtPct = (n) => `${(n * 100).toFixed(1)}%`;
export function formatTimestamp(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    return d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
}
