/**
 * GST invoice buyer details on an order.
 *
 * Shows the buyer's legal name and GSTIN, and whether the seller's tax invoice has
 * been issued yet. Renders nothing for orders without a GSTIN.
 */

import { Building2, FileText } from 'lucide-react';
import type { OrderDetails } from '@/actions/get-order-details';

interface B2bBuyerCardProps {
  order: OrderDetails;
}

export default function B2bBuyerCard({ order }: B2bBuyerCardProps) {
  if (!order.buyerGstin) return null;

  const issued = order.saleDocumentStatus === 'ISSUED';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gray-600" />
          GST Invoice
        </h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          B2B
        </span>
      </div>

      {issued ? (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-sm text-green-800">
          <FileText className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="font-semibold">Your tax invoice has been issued.</p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Tax invoice will be issued shortly after your order is processed.
        </div>
      )}

      <div className="space-y-2 text-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Buyer
        </p>
        {order.buyerLegalName && (
          <p className="font-semibold text-gray-900">{order.buyerLegalName}</p>
        )}
        <p className="font-mono text-gray-700">{order.buyerGstin}</p>
      </div>
    </div>
  );
}
