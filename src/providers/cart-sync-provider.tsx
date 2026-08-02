'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import useCart, {
  CART_CHECKOUT_CHANNEL,
  type CartOrderPlacedMessage,
} from '@/hooks/use-cart';

const isOrderPlacedMessage = (
  value: unknown
): value is CartOrderPlacedMessage => {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<CartOrderPlacedMessage>;
  return (
    message.type === 'ORDER_PLACED' &&
    typeof message.cartId === 'string' &&
    typeof message.cartRevision === 'number' &&
    typeof message.orderId === 'string'
  );
};

const CartSyncProvider = () => {
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'cart-storage') {
        void useCart.persist.rehydrate();
      }
    };
    window.addEventListener('storage', handleStorage);

    if (typeof BroadcastChannel === 'undefined') {
      return () => window.removeEventListener('storage', handleStorage);
    }

    const channel = new BroadcastChannel(CART_CHECKOUT_CHANNEL);
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (!isOrderPlacedMessage(event.data)) return;

      const current = useCart.getState();
      const cleared = current.clearPlacedCart(
        event.data.cartId,
        event.data.cartRevision
      );
      const storageAlreadySynchronized =
        current.cartId === event.data.cartId &&
        current.items.length === 0 &&
        current.cartRevision === event.data.cartRevision + 1;

      if (cleared || storageAlreadySynchronized) {
        toast.success('This order was placed in another tab.');
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorage);
      channel.close();
    };
  }, []);

  return null;
};

export default CartSyncProvider;
