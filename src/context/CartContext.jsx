
import React, {
  createContext,
  useContext,
  useState
} from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'nba-carrito';

export const CartProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      const datos = guardado ? JSON.parse(guardado) : [];
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  });

  const guardarCarrito = (actualizador) => {
    setCarrito((anterior) => {
      const nuevo = actualizador(anterior);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nuevo)
      );
      return nuevo;
    });
  };

  // Agregar productos
  const agregarAlCarrito = (producto) => {
    guardarCarrito((anterior) => {
      const existe = anterior.find(
        (item) => item.id === producto.id
      );

      if (existe) {
        return anterior.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...anterior, { ...producto, cantidad: 1 }];
    });
  };

  // Eliminar productos
  const eliminarDelCarrito = (id) => {
    guardarCarrito((anterior) =>
      anterior.filter((item) => item.id !== id)
    );
  };

  // Modificar cantidades
  const cambiarCantidad = (id, cantidad) => {
    if (cantidad < 1) {
      eliminarDelCarrito(id);
      return;
    }

    guardarCarrito((anterior) =>
      anterior.map((item) =>
        item.id === id
          ? { ...item, cantidad }
          : item
      )
    );
  };

  // Vaciar carrito
  const vaciarCarrito = () => {
    guardarCarrito(() => []);
  };

  // Cantidad total de artículos
  const cantidadTotal = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  // Precio total
  const total = carrito.reduce(
    (suma, item) =>
      suma + Number(item.precio || 0) * item.cantidad,
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
