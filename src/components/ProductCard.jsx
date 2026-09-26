import React from 'react';

const ProductCard = ({ producto }) => {
  return (
    <div className="product-card">
      <h3 className="product-name">{producto.nombre}</h3>
      <p className="product-description">{producto.descripcion}</p>
      <p className="precio product-price">${producto.precio.toLocaleString()}</p>
    </div>
  );
};

export default ProductCard;