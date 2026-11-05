
import React from 'react';
import './Carrito.css';

const Carrito = () => {
  return (
    <div className="carrito-container">
      <h1>🛒 Mi carrito de compras</h1>
      <p>Estos son los productos que agregaste.</p>

      <div className="carrito-vacio">
        <p>Tu carrito está vacío por ahora.</p>
      </div>
    </div>
  );
};

export default Carrito;
