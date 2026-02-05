import { Product, ProductVariant } from '@/types';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getEffectivePrice } from '@/lib/utils';

// Cart item includes variant info and effective price at time of add
interface CartItem extends Product {
  variantId: string;                    // Variant tracking (required)
  selectedVariant: ProductVariant;      // Full variant info for display
  effectivePrice: number;               // Price at time of adding to cart (variant price if available)
}

interface CartStore {
  items: CartItem[];
  addItem: (data: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (id: string, variantId: string) => void;
  removeAll: () => void;
  increaseQuantity: (id: string, variantId: string) => void;
  decreaseQuantity: (id: string, variantId: string) => void;
  updateQuantity: (id: string, quantity: number, variantId: string) => void;
}

// Helper to find item index in cart
// Same product with different sizes = different cart items
const findItemIndex = (items: CartItem[], productId: string, variantId: string): number => {
  return items.findIndex((item) => 
    item.id === productId && item.variantId === variantId
  );
};

// Cart store that's persistent in localStorage
const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      
      addItem: (data: Product, variant: ProductVariant, quantity: number = 1) => {
        const currentItems = get().items;

        // Check if this exact product+variant combo exists
        const existingIndex = findItemIndex(currentItems, data.id, variant.id);

        if (existingIndex !== -1) {
          // If item exists, increase its quantity
          const existingItem = currentItems[existingIndex];
          const newQuantity = (existingItem.quantity || 1) + quantity;
          
          // Check stock limit
          if (newQuantity > variant.stockQuantity) {
            toast.error(`Only ${variant.stockQuantity} available in this size`);
            return;
          }
          
          const updatedItems = [...currentItems];
          updatedItems[existingIndex] = { ...existingItem, quantity: newQuantity };
          set({ items: updatedItems });
          toast.success(quantity > 1 ? `Added ${quantity} items to cart` : 'Item quantity increased');
        } else {
          // Check stock limit for new items
          if (quantity > variant.stockQuantity) {
            toast.error(`Only ${variant.stockQuantity} available in this size`);
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
          set({ items: [...currentItems, newItem] });
          toast.success('Item added to cart');
        }
      },
      
      removeItem: (id: string, variantId: string) => {
        const currentItems = get().items;
        const itemIndex = findItemIndex(currentItems, id, variantId);

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
      
      increaseQuantity: (id: string, variantId: string) => {
        const currentItems = get().items;
        const itemIndex = findItemIndex(currentItems, id, variantId);
        
        if (itemIndex === -1) return;
        
        const item = currentItems[itemIndex];
        const newQuantity = (item.quantity || 1) + 1;
        
        // Check stock limit
        if (newQuantity > item.selectedVariant.stockQuantity) {
          toast.error(`Only ${item.selectedVariant.stockQuantity} available in this size`);
          return;
        }
        
        const updatedItems = [...currentItems];
        updatedItems[itemIndex] = { ...item, quantity: newQuantity };
        set({ items: updatedItems });
      },
      
      decreaseQuantity: (id: string, variantId: string) => {
        const currentItems = get().items;
        const itemIndex = findItemIndex(currentItems, id, variantId);
        
        if (itemIndex === -1) return;
        
        const item = currentItems[itemIndex];

        if ((item.quantity || 1) > 1) {
          // Decrease quantity if greater than 1
          const updatedItems = [...currentItems];
          updatedItems[itemIndex] = { ...item, quantity: (item.quantity || 1) - 1 };
          set({ items: updatedItems });
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
          
          // Check stock limit
          if (quantity > item.selectedVariant.stockQuantity) {
            toast.error(`Only ${item.selectedVariant.stockQuantity} available in this size`);
            return;
          }
          
          // Update the quantity
          const updatedItems = [...currentItems];
          updatedItems[itemIndex] = { ...item, quantity };
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