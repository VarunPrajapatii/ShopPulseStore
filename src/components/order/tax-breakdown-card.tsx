import type { OrderItem } from '@/actions/get-order-details';

interface TaxBreakdownCardProps {
  items: OrderItem[];
  placeOfSupply: string | null;
}

/** Returns true if at least one item has any GST/tax snapshot data. */
function hasTaxData(items: OrderItem[]): boolean {
  return items.some(
    (item) =>
      item.taxableAmount != null ||
      item.cgstAmount != null ||
      item.sgstAmount != null ||
      item.igstAmount != null ||
      item.cessAmount != null
  );
}

function fmt(n: number | null): string {
  if (n == null) return '—';
  return `₹${n.toFixed(2)}`;
}

function fmtRate(n: number | null): string {
  if (n == null) return '—';
  return `${n}%`;
}

export default function TaxBreakdownCard({
  items,
  placeOfSupply,
}: TaxBreakdownCardProps) {
  if (!hasTaxData(items)) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-1">Tax Breakdown</h3>
      {placeOfSupply && (
        <p className="text-sm text-gray-500 mb-4">
          Place of supply: {placeOfSupply}
        </p>
      )}

      <div className="overflow-x-auto -mx-2">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-2 py-2 font-medium">Item</th>
              <th className="px-2 py-2 font-medium text-right">HSN</th>
              <th className="px-2 py-2 font-medium text-right">Taxable</th>
              <th className="px-2 py-2 font-medium text-right">CGST</th>
              <th className="px-2 py-2 font-medium text-right">SGST</th>
              <th className="px-2 py-2 font-medium text-right">IGST</th>
              <th className="px-2 py-2 font-medium text-right">Cess</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="text-gray-700">
                <td className="px-2 py-3 font-medium max-w-[140px] truncate">
                  {item.productName}
                </td>
                <td className="px-2 py-3 text-right text-gray-500 font-mono text-xs">
                  {item.hsnCodeSnapshot ?? '—'}
                </td>
                <td className="px-2 py-3 text-right">
                  {fmt(item.taxableAmount)}
                </td>
                <td className="px-2 py-3 text-right">
                  {item.cgstAmount != null ? (
                    <span title={fmtRate(item.cgstRate)}>
                      {fmt(item.cgstAmount)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-2 py-3 text-right">
                  {item.sgstAmount != null ? (
                    <span title={fmtRate(item.sgstRate)}>
                      {fmt(item.sgstAmount)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-2 py-3 text-right">
                  {item.igstAmount != null ? (
                    <span title={fmtRate(item.igstRate)}>
                      {fmt(item.igstAmount)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-2 py-3 text-right">
                  {item.cessAmount != null ? (
                    <span title={fmtRate(item.cessRate)}>
                      {fmt(item.cessAmount)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Hover rate cells to see the applicable tax rate. CGST + SGST applies for
        intra-state; IGST applies for inter-state supply.
      </p>
    </div>
  );
}
