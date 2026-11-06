import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'nba-carrito';

const loadInitialCart = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const saveCart = (items) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Ignore storage errors
    }
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: loadInitialCart(),
        total: 0
    },
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;
            if (!product || product.id === undefined) return;
            const qtyToAdd = Number(product.cantidad) > 0 ? Number(product.cantidad) : 1;
            const existingItem = state.items.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.cantidad += qtyToAdd;
            } else {
                state.items.push({
                    ...product,
                    precio: Number(product.precio) || 0,
                    cantidad: qtyToAdd
                });
            }
            saveCart(state.items);
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload);
            saveCart(state.items);
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.items.find(item => item.id === id);
            if (item && quantity > 0) {
                item.cantidad = quantity;
                saveCart(state.items);
            }
        },
        clearCart: (state) => {
            state.items = [];
            saveCart(state.items);
        }
    }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
