import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productsData from '../products.json';

const ProductDetail = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const producto = productsData.find((p) => p.id === parseInt(id));

    if (!producto) {
        return (
            <div style={{ textAlign: 'center', padding: '30px' }}>
                <h2>Producto no encontrado</h2>
                <button className="btn-onoff" onClick={() => navigate('/')}>
                    Volver al Inicio
                </button>
            </div>
        );
    }

    return (
        <div className="product-card" style={{ width: '100%', maxWidth: '450px', margin: '20px auto', textAlign: 'center' }}>
            <h2>Detalle del Producto</h2>
            <h3 style={{ fontSize: '1.6rem', color: '#1d428a' }}>{producto.nombre}</h3>
            <p style={{ margin: '15px 0' }}>{producto.descripcion}</p>
            <p className="precio" style={{ fontSize: '1.4rem', marginBottom: '20px' }}>
                ${producto.precio.toLocaleString()}
            </p>
            <button className="btn-onoff" onClick={() => navigate(-1)}>
                Volver
            </button>
        </div>
    );
};

export default ProductDetail;