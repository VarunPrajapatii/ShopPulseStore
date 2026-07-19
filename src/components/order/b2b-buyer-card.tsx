import { Building2, FileText } from 'lucide-react';
import type { OrderDetails } from '@/actions/get-order-details';

interface B2bBuyerCardProps {
  order: OrderDetails;
}

export default function B2bBuyerCard({ order }: B2bBuyerCardProps) {
  if (!order.buyerGstin) return null;

  const hasInvoice = !!order.invoiceNumber;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gray-600" />
          GST / Tax Invoice
        </h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          B2B
        </span>
      </div>

      {/* Invoice status */}
      {hasInvoice ? (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <FileText className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-green-800">
              Tax Invoice #{order.invoiceNumber}
              {order.invoiceFy && (
                <span className="font-normal text-green-700">
                  {' '}
                  · FY {order.invoiceFy}
                </span>
              )}
            </p>
            {order.invoiceDate && (
              <p className="text-green-700 text-xs mt-0.5">
                Issued on{' '}
                {new Date(order.invoiceDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Tax invoice will be issued shortly after your order is processed.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        {/* Buyer details */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Buyer
          </p>
          {order.buyerLegalName && (
            <p className="font-semibold text-gray-900">
              {order.buyerLegalName}
            </p>
          )}
          <p className="font-mono text-gray-700">{order.buyerGstin}</p>
          {order.buyerStateCode && (
            <p className="text-gray-600">
              State code:{' '}
              <span className="font-medium">{order.buyerStateCode}</span>
            </p>
          )}
          {order.buyerPan && (
            <p className="text-gray-600">
              PAN: <span className="font-mono">{order.buyerPan}</span>
            </p>
          )}
        </div>

        {/* Billing address */}
        {order.buyerBillingAddress && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Billing Address
            </p>
            <div className="text-gray-700 leading-relaxed">
              <p>{order.buyerBillingAddress.line1}</p>
              {order.buyerBillingAddress.line2 && (
                <p>{order.buyerBillingAddress.line2}</p>
              )}
              <p>
                {order.buyerBillingAddress.city},{' '}
                {order.buyerBillingAddress.state}
              </p>
              <p>{order.buyerBillingAddress.pincode}</p>
            </div>
          </div>
        )}

        {/* Seller GSTIN */}
        {order.sellerGstin && (
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Seller GSTIN
            </p>
            <p className="font-mono text-gray-700">{order.sellerGstin}</p>
          </div>
        )}

        {/* Place of supply */}
        {order.placeOfSupply && (
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Place of Supply
            </p>
            <p className="text-gray-700">{order.placeOfSupply}</p>
          </div>
        )}
      </div>
    </div>
  );
}
