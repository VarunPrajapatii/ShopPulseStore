import { Product } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


interface CartStore {
    items: Product[];
    addItem: (data: Product) => void;
    removeItem: (id: string) => void;
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
                return toast("Item already in cart");
            }

            set({ items: [...get().items, data] });
        },
        removeItem: (id: string) => {
            set({ items: get().items.filter((item) => item.id !== id) });
            toast.success("Item removed from cart");
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