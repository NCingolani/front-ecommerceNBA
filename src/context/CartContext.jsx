import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart
} from '../store/slices/cartSlice';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const dispatch = useDispatch();
  const carrito = useSelector((store) => store.cart.items);

  // Agregar productos validando el stock disponible
  const agregarAlCarrito = (producto) => {
    const stockDisponible = Number(producto.stock ?? 0);

    if (stockDisponible <= 0) {
      alert(`"${producto.nombre}" no tiene stock disponible.`);
      return;
    }

    const itemEnCarrito = carrito.find((item) => item.id === producto.id);
    const cantidadActual = Number(itemEnCarrito?.cantidad || 0);
    const cantidadAAgregar = Number(producto.cantidad || 1);

    if (cantidadActual + cantidadAAgregar > stockDisponible) {
      alert(`No hay suficiente stock de "${producto.nombre}". Disponibles: ${stockDisponible}.`);
      return;
    }

    dispatch(addToCart(producto));
  };

  // Eliminar productos
  const eliminarDelCarrito = (id) => {
    dispatch(removeFromCart(id));
  };

  // Modificar cantidades
  const cambiarCantidad = (id, cantidad) => {
    if (cantidad < 1) {
      dispatch(removeFromCart(id));
      return;
    }
    dispatch(updateQuantity({ id, quantity: cantidad }));
  };

  // Vaciar carrito
  const vaciarCarrito = () => {
    dispatch(clearCart());
  };

  // Cantidad total de artículos
  const cantidadTotal = carrito.reduce(
    (total, item) => total + Number(item.cantidad || 0),
    0
  );

  // Precio total
  const total = carrito.reduce(
    (suma, item) =>
      suma + Number(item.precio || 0) * Number(item.cantidad || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        cambiarCantidad,
        vaciarCarrito,
        cantidadTotal,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart debe utilizarse dentro de CartProvider'
    );
  }

  return context;
};
