'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import useCart, {
  CART_CHECKOUT_CHANNEL,
  CART_TAB_ID,
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
    typeof message.orderId === 'string' &&
    typeof message.senderTabId === 'string'
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
      // The tab that placed the order already updated its own cart.
      if (event.data.senderTabId === CART_TAB_ID) return;

      // The placing tab already wrote the remaining cart to storage.
      void useCart.persist.rehydrate();
      toast.success('This order was placed in another tab.');
    };

    return () => {
      window.removeEventListener('storage', handleStorage);
      channel.close();
    };
  }, []);

  return null;
};

export default CartSyncProvider;
