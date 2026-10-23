import React from 'react';
import { Link } from 'react-router-dom';
import OnOff from './OnOff';

const ProductCard = ({ producto }) => {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={producto.imagen || 'https://via.placeholder.com/200'}
          alt={producto.nombre}
          className="product-image"
          style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }}
        />
      </div>

      <h3 className="product-name" style={{ marginTop: 0 }}>{producto.nombre}</h3>
      <p className="product-description">{producto.descripcion}</p>
      <p className="precio product-price" style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '15px' }}>
        ${producto.precio.toLocaleString()}
      </p>

      {/* Botón interactivo de carrito */}
      <OnOff />

      <Link
        to={`/producto/${producto.id}`}
        className="btn-onoff"
        style={{
          textDecoration: 'none',
          display: 'block',
          textAlign: 'center',
          marginTop: '10px'
        }}
      >
        Ver Detalle
      </Link>
    </div>
  );
};

export default ProductCard;