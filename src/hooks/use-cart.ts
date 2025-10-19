import { Product } from '@/types';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CartStore {
  items: Product[];
  addItem: (data: Product) => void;
  removeItem: (id: string) => void;
  removeAll: () => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
}

// we are going to make a store thats persistent in global storage
const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      addItem: (data: Product) => {
        const currentItems = get().items;

        // Check if the item already exists in the cart
        const existingItem = currentItems.find((item) => item.id === data.id);

        if (existingItem) {
          // If item exists, increase its quantity
          const updatedItems = currentItems.map((item) =>
            item.id === data.id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          );
          set({ items: updatedItems });
          toast.success('Item quantity increased');
        } else {
          // If item doesn't exist, add it with quantity 1
          set({ items: [...currentItems, { ...data, quantity: 1 }] });

          toast.success('Item added to cart');
        }
      },
      removeItem: (id: string) => {
        const currentItems = get().items;
        const itemIndex = currentItems.findIndex((item) => item.id === id);

        if (itemIndex > -1) {
          const newItems = [...currentItems];
          newItems.splice(itemIndex, 1);
          set({ items: newItems });
          toast.success('Item removed from cart');
        }
      },
      removeAll: () => {
        set({ items: [] });
        toast.success('All items removed from cart');
      },
      increaseQuantity: (id: string) => {
        const currentItems = get().items;
        const updatedItems = currentItems.map((item) =>
          item.id === id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
        set({ items: updatedItems });
      },
      decreaseQuantity: (id: string) => {
        const currentItems = get().items;
        const item = currentItems.find((item) => item.id === id);

        if (item && (item.quantity || 1) > 1) {
          // Decrease quantity if greater than 1
          const updatedItems = currentItems.map((item) =>
            item.id === id
              ? { ...item, quantity: (item.quantity || 1) - 1 }
              : item
          );

          set({ items: updatedItems });
        } else {
          // Remove item if quantity is 1
          get().removeItem(id);
        }
      },
      updateQuantity: (id: string, quantity: number) => {
        const currentItems = get().items;

        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          get().removeItem(id);
        } else {
          // Update the quantity
          const updatedItems = currentItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          );
          set({ items: updatedItems });
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
