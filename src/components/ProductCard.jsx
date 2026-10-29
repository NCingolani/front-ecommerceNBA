import React from 'react';
import { Link } from 'react-router-dom';
import OnOff from './OnOff';

const ProductCard = ({ producto, onAddToCart }) => {
  const precio = Number(producto.precio);

  return (
    <div className="product-card">
      <div className="product-image-container">
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="product-image"
            style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }}
          />
        ) : (
          <div className="product-image product-image-empty" role="img" aria-label={`Sin imagen: ${producto.nombre}`} />
        )}
      </div>

      <h3 className="product-name" style={{ marginTop: 0 }}>{producto.nombre}</h3>
      <p className="product-description">{producto.descripcion}</p>
      <p className="precio product-price" style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '15px' }}>
        {Number.isFinite(precio)
          ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precio)
          : 'Precio no disponible'}
      </p>

      {/* Botón interactivo de carrito */}
      {onAddToCart ? (
        <button className="btn-onoff" type="button" onClick={() => onAddToCart(producto)}>
          🛒 Añadir al carrito
        </button>
      ) : (
        <OnOff />
      )}

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
