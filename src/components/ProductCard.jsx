import React from 'react';

// El componente recibe "producto" a través de las props
const ProductCard = ({ producto }) => {
  return (
    <div className="product-card">
      <h3 className="product-name">{producto.nombre}</h3>
      <p className="product-description">{producto.descripcion}</p>
      <p className="product-price">${producto.precio.toLocaleString()}</p>
    </div>
  );
};

export default ProductCard;