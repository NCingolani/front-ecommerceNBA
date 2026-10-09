import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ producto }) => {
  return (
    <div className="product-card">
      <h3 className="product-name">{producto.nombre}</h3>
      <p className="product-description">{producto.descripcion}</p>
      <p className="precio product-price">${producto.precio.toLocaleString()}</p>
      <Link
      to={`/producto/${producto.id}`} 
        className="btn-onoff" 
        style={{ 
          textDecoration: 'none', 
          display: 'block', 
          textAlign: 'center', 
          marginTop: '15px' 
        }}
      >
        Ver Detalle
      </Link>
    </div>
  );
};

export default ProductCard;