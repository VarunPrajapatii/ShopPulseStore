import type { OrderItem } from '@/actions/get-order-details';

interface TaxBreakdownCardProps {
  items: OrderItem[];
  placeOfSupply: string | null;
  invoiced?: boolean;
}

/** Returns true if at least one item carries GST from the checkout quote. */
function hasTaxData(items: OrderItem[]): boolean {
  return items.some(
    (item) =>
      (item.cgstAmount ?? 0) +
        (item.sgstAmount ?? 0) +
        (item.utgstAmount ?? 0) +
        (item.igstAmount ?? 0) +
        (item.cessAmount ?? 0) >
      0
  );
}

function fmt(n: number | null): string {
  if (n == null || n === 0) return '—';
  return `₹${n.toFixed(2)}`;
}

export default function TaxBreakdownCard({
  items,
  placeOfSupply,
  invoiced = false,
}: TaxBreakdownCardProps) {
  if (!hasTaxData(items)) return null;
  const hasUtgst = items.some((item) => (item.utgstAmount ?? 0) > 0);
  const intraStateLabel = hasUtgst ? 'UTGST' : 'SGST';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-1">
        {invoiced ? 'GST (as invoiced)' : 'Estimated GST'}
      </h3>
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
              <th className="px-2 py-2 font-medium text-right">Rate</th>
              <th className="px-2 py-2 font-medium text-right">Taxable</th>
              <th className="px-2 py-2 font-medium text-right">CGST</th>
              <th className="px-2 py-2 font-medium text-right">
                {intraStateLabel}
              </th>
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
                  {item.hsnCode ?? '—'}
                </td>
                <td className="px-2 py-3 text-right">
                  {item.gstRatePercent != null
                    ? `${item.gstRatePercent}%`
                    : '—'}
                </td>
                <td className="px-2 py-3 text-right">
                  {fmt(item.taxableAmount)}
                </td>
                <td className="px-2 py-3 text-right">{fmt(item.cgstAmount)}</td>
                <td className="px-2 py-3 text-right">
                  {fmt((item.sgstAmount ?? 0) + (item.utgstAmount ?? 0))}
                </td>
                <td className="px-2 py-3 text-right">{fmt(item.igstAmount)}</td>
                <td className="px-2 py-3 text-right">{fmt(item.cessAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        GST is already included in the prices you paid. CGST with SGST or UTGST
        applies within the State; IGST applies between States.
      </p>
    </div>
  );
}
