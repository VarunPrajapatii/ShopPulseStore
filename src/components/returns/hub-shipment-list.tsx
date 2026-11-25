'use client';

/**
 * Public forward-shipment cards for the unified order page.
 * It intentionally renders only customer-safe fields from the tracking hub.
 */

import { ExternalLink, Package } from 'lucide-react';
import StatusBadge from '@/components/returns/status-badge';
import type { HubShipment } from '@/lib/returns-types';

interface HubShipmentListProps {
  shipments: HubShipment[];
}

export default function HubShipmentList({ shipments }: HubShipmentListProps) {
  if (shipments.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">Shipments</h2>
      <div className="mt-3 space-y-3">
        {shipments.map((shipment, index) => (
          <article
            key={`${shipment.awb ?? 'shipment'}-${index}`}
            className="rounded-lg border border-border bg-muted/30 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {shipment.courierName ?? 'Courier pending'}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    AWB: {shipment.awb ?? 'Not assigned yet'}
                  </p>
                </div>
              </div>
              <StatusBadge status={shipment.status} />
            </div>

            {shipment.items.length > 0 && (
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {shipment.items
                  .map(
                    (item) =>
                      `${item.productName}${item.variantLabel ? ` (${item.variantLabel})` : ''} x${item.quantity}`
                  )
                  .join(', ')}
              </p>
            )}

            {shipment.trackingUrl && (
              <a
                href={shipment.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Track on courier site
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
