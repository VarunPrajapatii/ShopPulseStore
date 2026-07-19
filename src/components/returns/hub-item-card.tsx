'use client';

/**
 * HubItemCard — one ordered line item in the hub's "Items" section.
 *
 * Shows the product snapshot, quantities, and the remaining return/exchange/
 * replacement windows. The "Start a return" CTA renders only when the server
 * marks the item `canStartReturn`; otherwise the blocked reason(s) are shown as
 * a muted line (Amazon/Myntra style — same place, just disabled messaging).
 */

import Image from 'next/image';
import { ImageOff, ShieldAlert } from 'lucide-react';
import Currency from '@/components/ui/currency';
import type { HubItem } from '@/lib/returns-types';

interface HubItemCardProps {
  item: HubItem;
  onStartReturn: (orderItemId: string) => void;
  onFileComplaint: (orderItemId: string) => void;
}

function windowLine(item: HubItem): string | null {
  const windows = item.windowsRemaining;
  const parts: string[] = [];
  if (windows.return) parts.push(`Return ${windows.return.daysLeft}d left`);
  if (windows.exchange)
    parts.push(`Exchange ${windows.exchange.daysLeft}d left`);
  if (windows.replacement)
    parts.push(`Replacement ${windows.replacement.daysLeft}d left`);
  return parts.length ? parts.join(' · ') : null;
}

const HubItemCard: React.FC<HubItemCardProps> = ({
  item,
  onStartReturn,
  onFileComplaint,
}) => {
  const { snapshot } = item;
  const window = windowLine(item);

  return (
    <div className="flex gap-3 py-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {snapshot.imageUrl ? (
          <Image
            src={snapshot.imageUrl}
            alt={snapshot.productName}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {snapshot.productName}
        </p>
        {snapshot.variantLabel && (
          <p className="text-xs text-muted-foreground">
            {snapshot.variantLabel}
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          Qty {item.qtyOrdered}
          {item.qtyAvailable < item.qtyOrdered &&
            ` · ${item.qtyAvailable} available to return`}
          {' · '}
          <Currency
            amount={snapshot.unitPriceInr}
            className="text-xs font-medium"
          />
        </p>

        {item.canStartReturn ? (
          <>
            {window && <p className="mt-1 text-xs text-green-700">{window}</p>}
            <button
              type="button"
              onClick={() => onStartReturn(item.orderItemId)}
              className="mt-2 rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary"
            >
              Return or exchange
            </button>
          </>
        ) : (
          item.blockedReasons.length > 0 && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {item.blockedReasons[0]}
            </p>
          )
        )}

        {/* Protected reasons stay reachable even when the item isn't returnable
            damaged-on-arrival / not-as-described complaints. */}
        {!item.canStartReturn && (
          <button
            type="button"
            onClick={() => onFileComplaint(item.orderItemId)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Damaged or not as described? File a complaint
          </button>
        )}
      </div>
    </div>
  );
};

export default HubItemCard;
