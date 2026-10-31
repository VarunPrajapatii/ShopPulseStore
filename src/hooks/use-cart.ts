import { Product, ProductVariant } from '@/types';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getEffectivePrice } from '@/lib/utils';

// Cart item includes variant info and effective price at time of add
interface CartItem extends Product {
  variantId: string; // Variant tracking (required)
  selectedVariant: ProductVariant; // Full variant info for display
  effectivePrice: number; // Price at time of adding to cart (variant price if available)
}

interface CartStore {
  items: CartItem[];
  cartId: string;
  cartRevision: number;
  addItem: (data: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (id: string, variantId: string) => void;
  removeAll: () => void;
  increaseQuantity: (id: string, variantId: string) => void;
  decreaseQuantity: (id: string, variantId: string) => void;
  updateQuantity: (id: string, quantity: number, variantId: string) => void;
  completeOrder: (
    orderId: string,
    cartId: string,
    cartRevision: number,
    orderedLines: CartOrderedLine[]
  ) => void;
}

// One line that was submitted with an order (product + variant + quantity).
export interface CartOrderedLine {
  productId: string;
  variantId: string;
  quantity: number;
}

// Largest quantity for one line: stock, further capped by the store's per-order limit.
const getQuantityLimit = (stock: number, cap?: number) =>
  cap !== undefined ? Math.min(stock, cap) : stock;

const quantityLimitMessage = (stock: number, cap?: number) =>
  cap !== undefined && cap < stock
    ? `Max ${cap} per order`
    : `Only ${stock} available in this size`;

export const CART_CHECKOUT_CHANNEL = 'shoppulse-cart-checkout';

export interface CartOrderPlacedMessage {
  type: 'ORDER_PLACED';
  cartId: string;
  cartRevision: number;
  orderId: string;
  senderTabId: string;
}

const createCartId = () => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

// Unique per browser tab; lets a tab recognise its own broadcast messages.
export const CART_TAB_ID = createCartId();

// Helper to find item index in cart
// Same product with different sizes = different cart items
const findItemIndex = (
  items: CartItem[],
  productId: string,
  variantId: string
): number => {
  return items.findIndex(
    (item) => item.id === productId && item.variantId === variantId
  );
};

// Cart store that's persistent in localStorage
const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      cartId: createCartId(),
      cartRevision: 0,

      addItem: (
        data: Product,
        variant: ProductVariant,
        quantity: number = 1
      ) => {
        const currentItems = get().items;

        // Check if this exact product+variant combo exists
        const existingIndex = findItemIndex(currentItems, data.id, variant.id);

        if (existingIndex !== -1) {
          // If item exists, increase its quantity
          const existingItem = currentItems[existingIndex];
          const newQuantity = (existingItem.quantity || 1) + quantity;

          // Check stock and per-order limit
          if (
            newQuantity >
            getQuantityLimit(variant.stockQuantity, data.maxQuantityPerItem)
          ) {
            toast.error(
              quantityLimitMessage(
                variant.stockQuantity,
                data.maxQuantityPerItem
              )
            );
            return;
          }

          const updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: newQuantity,
          };
          set({
            items: updatedItems,
            cartRevision: (get().cartRevision ?? 0) + 1,
          });
          toast.success(
            quantity > 1
              ? `Added ${quantity} items to cart`
              : 'Item quantity increased'
          );
        } else {
          // Check stock and per-order limit for new items
          if (
            quantity >
            getQuantityLimit(variant.stockQuantity, data.maxQuantityPerItem)
          ) {
            toast.error(
              quantityLimitMessage(
                variant.stockQuantity,
                data.maxQuantityPerItem
              )
            );
            return;
          }

          // Calculate effective price using variant pricing priority
          const effectivePrice = getEffectivePrice(data, variant);

          // If item doesn't exist, add it with specified quantity
          const newItem: CartItem = {
            ...data,
            quantity,
            variantId: variant.id,
            selectedVariant: variant,
            effectivePrice,
          };
          set({
            items: [...currentItems, newItem],
            cartRevision: (get().cartRevision ?? 0) + 1,
          });
          toast.success('Item added to cart');
        }
      },

      removeItem: (id: string, variantId: string) => {
        const currentItems = get().items;
        const itemIndex = findItemIndex(currentItems, id, variantId);

        if (itemIndex > -1) {
          const newItems = [...currentItems];
          newItems.splice(itemIndex, 1);
          set({
            items: newItems,
            cartRevision: (get().cartRevision ?? 0) + 1,
          });
          toast.success('Item removed from cart');
        }
      },

      removeAll: () => {
        if (get().items.length === 0) return;
        set({
          items: [],
          cartRevision: (get().cartRevision ?? 0) + 1,
        });
        toast.success('All items removed from cart');
      },

      increaseQuantity: (id: string, variantId: string) => {
        const currentItems = get().items;
        const itemIndex = findItemIndex(currentItems, id, variantId);

        if (itemIndex === -1) return;

        const item = currentItems[itemIndex];
        const newQuantity = (item.quantity || 1) + 1;

        // Check stock and per-order limit
        if (
          newQuantity >
          getQuantityLimit(
            item.selectedVariant.stockQuantity,
            item.maxQuantityPerItem
          )
        ) {
          toast.error(
            quantityLimitMessage(
              item.selectedVariant.stockQuantity,
              item.maxQuantityPerItem
            )
          );
          return;
        }

        const updatedItems = [...currentItems];
        updatedItems[itemIndex] = { ...item, quantity: newQuantity };
        set({
          items: updatedItems,
          cartRevision: (get().cartRevision ?? 0) + 1,
        });
      },

      decreaseQuantity: (id: string, variantId: string) => {
        const currentItems = get().items;
        const itemIndex = findItemIndex(currentItems, id, variantId);

        if (itemIndex === -1) return;

        const item = currentItems[itemIndex];

        if ((item.quantity || 1) > 1) {
          // Decrease quantity if greater than 1
          const updatedItems = [...currentItems];
          updatedItems[itemIndex] = {
            ...item,
            quantity: (item.quantity || 1) - 1,
          };
          set({
            items: updatedItems,
            cartRevision: (get().cartRevision ?? 0) + 1,
          });
        } else {
          // Remove item if quantity is 1
          get().removeItem(id, variantId);
        }
      },

      updateQuantity: (id: string, quantity: number, variantId: string) => {
        const currentItems = get().items;
        const itemIndex = findItemIndex(currentItems, id, variantId);

        if (itemIndex === -1) return;

        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          get().removeItem(id, variantId);
        } else {
          const item = currentItems[itemIndex];

          if ((item.quantity || 1) === quantity) return;

          // Check stock and per-order limit
          if (
            quantity >
            getQuantityLimit(
              item.selectedVariant.stockQuantity,
              item.maxQuantityPerItem
            )
          ) {
            toast.error(
              quantityLimitMessage(
                item.selectedVariant.stockQuantity,
                item.maxQuantityPerItem
              )
            );
            return;
          }

          // Update the quantity
          const updatedItems = [...currentItems];
          updatedItems[itemIndex] = { ...item, quantity };
          set({
            items: updatedItems,
            cartRevision: (get().cartRevision ?? 0) + 1,
          });
        }
      },

      completeOrder: (
        orderId: string,
        cartId: string,
        cartRevision: number,
        orderedLines: CartOrderedLine[]
      ) => {
        // Remove only what was ordered; lines added in other tabs stay in the cart.
        const ordered = new Map<string, number>();
        for (const line of orderedLines) {
          const key = `${line.productId}:${line.variantId}`;
          ordered.set(key, (ordered.get(key) ?? 0) + line.quantity);
        }

        const remaining = get().items.flatMap((item) => {
          const left =
            (item.quantity || 1) -
            (ordered.get(`${item.id}:${item.variantId}`) ?? 0);
          return left > 0 ? [{ ...item, quantity: left }] : [];
        });

        set({
          items: remaining,
          cartRevision: (get().cartRevision ?? 0) + 1,
        });

        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel(CART_CHECKOUT_CHANNEL);
          const message: CartOrderPlacedMessage = {
            type: 'ORDER_PLACED',
            cartId,
            cartRevision,
            orderId,
            senderTabId: CART_TAB_ID,
          };
          channel.postMessage(message);
          channel.close();
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCart;
