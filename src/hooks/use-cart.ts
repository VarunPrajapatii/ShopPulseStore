import { Product } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


interface CartStore {
    items: Product[];
    addItem: (data: Product) => void;
    removeItem: (id: string) => void;
    decreaseQuantity: (id: string) => void;
    removeAll: () => void;
}

// we are going to make a store thats persistent in global storage
const useCart = create(
    persist<CartStore>((set, get) => ({
        items: [],
        addItem: (data: Product) => {
            const currentItems = get().items;
            const existingItem = currentItems.find((item) => item.id === data.id);

            if (existingItem) {
                // Allow multiple quantities - just add the item again
                set({ items: [...get().items, data] });
                toast.success("Item quantity increased");
            } else {
                set({ items: [...get().items, data] });
                toast.success("Item added to cart");
            }
        },
        removeItem: (id: string) => {
            set({ items: get().items.filter((item) => item.id !== id) });
            toast.success("Item removed from cart");
        },
        decreaseQuantity: (id: string) => {
            const currentItems = get().items;
            const itemIndex = currentItems.findIndex((item) => item.id === id);
            
            if (itemIndex !== -1) {
                const newItems = [...currentItems];
                newItems.splice(itemIndex, 1); // Remove one instance
                set({ items: newItems });
                toast.success("Item quantity decreased");
            }
        },
        removeAll: () => {
            set({ items: [] });
            toast.success("All items removed from cart");
        }
    }), {
        name: "cart-storage",
        storage: createJSONStorage(() => localStorage)
    })
);

export default useCart;