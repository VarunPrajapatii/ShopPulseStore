'use client';

/**
 * OrderDetailSlideOver — right-side panel with the full order detail
 * Shows the ordered items, shipping address, courier/AWB when
 * present, and the money breakdown. The "Cancel order" button renders ONLY when
 * `order.canCancel === true` (server truth) and delegates to the parent, which
 * runs the capability guard and opens the cancel modal.
 */

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Image from 'next/image';
import { ImageOff, MapPin, X, XCircle } from 'lucide-react';
import IconButton from '@/components/ui/icon-button';
import Currency from '@/components/ui/currency';
import StatusBadge from '@/components/returns/status-badge';
import TaxBreakdownCard from '@/components/order/tax-breakdown-card';
import type { HubItem, HubOrder } from '@/lib/returns-types';
import type { OrderItem } from '@/actions/get-order-details';

interface OrderDetailSlideOverProps {
  order: HubOrder | null;
  items: HubItem[];
  /** Full OrderItem list with GST/tax snapshot fields. Optional — when absent
   * the TaxBreakdownCard self-guards and renders nothing. */
  orderItems?: OrderItem[];
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const OrderDetailSlideOver: React.FC<OrderDetailSlideOverProps> = ({
  order,
  items,
  orderItems = [],
  open,
  onClose,
  onCancel,
}) => {
  const hasCoupon = order ? Number(order.couponInr) > 0 : false;
  const addr = order?.shippingAddress;
  const placedOn = order ? formatDate(order.placedAt) : null;

  return (
    <Transition show={open} appear as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-y-0 right-0 flex max-w-full">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="flex h-full w-screen max-w-md flex-col bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <Dialog.Title className="text-base font-semibold text-foreground">
                    Order details
                  </Dialog.Title>
                  <IconButton onClick={onClose} icon={<X size={15} />} />
                </div>

                {order ? (
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    {/* Identity */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          #
                          {order.orderNumber ??
                            order.id.slice(0, 8).toUpperCase()}
                        </p>
                        {placedOn && (
                          <p className="text-xs text-muted-foreground">
                            Placed on {placedOn}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={order.orderStatus} />
                    </div>

                    {/* Items */}
                    <div className="mt-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Items
                      </h3>
                      <ul className="mt-2 divide-y divide-border">
                        {items.map((item) => (
                          <li
                            key={item.orderItemId}
                            className="flex gap-3 py-3"
                          >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {item.snapshot.imageUrl ? (
                                <Image
                                  src={item.snapshot.imageUrl}
                                  alt={item.snapshot.productName}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <ImageOff size={16} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {item.snapshot.productName}
                              </p>
                              {item.snapshot.variantLabel && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {item.snapshot.variantLabel}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Qty {item.qtyOrdered} ·{' '}
                                <Currency
                                  amount={item.snapshot.unitPriceInr}
                                  className="text-xs font-medium"
                                />
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Shipping address */}
                    {addr && (addr.line1 || addr.city) && (
                      <div className="mt-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Shipping address
                        </h3>
                        <div className="mt-2 flex gap-2 rounded-xl bg-muted/50 p-3 text-sm">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <address className="not-italic text-muted-foreground">
                            {addr.name && (
                              <span className="font-medium text-foreground">
                                {addr.name}
                              </span>
                            )}
                            {addr.name && <br />}
                            {[addr.line1, addr.line2]
                              .filter(Boolean)
                              .join(', ')}
                            {addr.line1 && <br />}
                            {[addr.city, addr.state, addr.pincode]
                              .filter(Boolean)
                              .join(', ')}
                            {addr.phone && (
                              <>
                                <br />
                                {addr.phone}
                              </>
                            )}
                          </address>
                        </div>
                      </div>
                    )}

                    {/* Money */}
                    <dl className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Subtotal</dt>
                        <dd>
                          <Currency
                            amount={order.subtotalInr}
                            className="text-sm font-medium"
                          />
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Shipping</dt>
                        <dd>
                          <Currency
                            amount={order.shippingInr}
                            className="text-sm font-medium"
                          />
                        </dd>
                      </div>
                      {hasCoupon && (
                        <div className="flex items-center justify-between text-green-700">
                          <dt>Coupon discount</dt>
                          <dd className="text-sm font-medium">
                            −
                            <Currency
                              amount={order.couponInr}
                              className="text-sm font-medium text-green-700"
                            />
                          </dd>
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t border-border pt-2">
                        <dt className="font-semibold text-foreground">
                          {order.isPaid ? 'Paid' : 'Amount'}
                        </dt>
                        <dd>
                          <Currency
                            amount={order.paidInr}
                            className="text-base"
                          />
                        </dd>
                      </div>
                    </dl>

                    {/* Tax breakdown — only renders when orderItems carry GST snapshot data */}
                    {orderItems.length > 0 && (
                      <div className="mt-5">
                        <TaxBreakdownCard
                          items={orderItems}
                          placeOfSupply={null}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1" />
                )}

                {/* Cancel order — only when server allows it */}
                {order?.canCancel && (
                  <div className="border-t border-border px-5 py-4">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel order
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default OrderDetailSlideOver;
