// Manual Ch-7–8: display rounding never changes the stored answer or fraction.
export function formatNumber(value, { display, digits, norm }) {
  if (!Number.isFinite(value)) return String(value);
  const significantDigits = display === 'sci' ? digits : 10;
  const scientific = new Intl.NumberFormat('en-US', { useGrouping: false, notation: 'scientific',
    minimumSignificantDigits: significantDigits, maximumSignificantDigits: significantDigits }).format(value);
  const [mantissa, exponent] = scientific.split('E');
  const exponential = `${mantissa}e${Number(exponent) >= 0 ? '+' : ''}${Number(exponent)}`;
  if (display === 'sci') return exponential;
  if (display === 'fix' && Math.abs(value) < 1e10) {
    const text = new Intl.NumberFormat('en-US', { useGrouping: false,
      minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
    return Number(text) === 0 ? (0).toFixed(digits) : text;
  }
  const rounded = Number(exponential);
  if (rounded === 0) return '0';
  const magnitude = Math.abs(rounded);
  if (magnitude < (norm === 2 ? 1e-9 : 1e-2) || magnitude >= 1e10) {
    return `${Number(mantissa)}e${Number(exponent) >= 0 ? '+' : ''}${Number(exponent)}`;
  }
  return new Intl.NumberFormat('en-US', { useGrouping: false, maximumSignificantDigits: 10 }).format(value);
}
