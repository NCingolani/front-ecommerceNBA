import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 2do Componente que llama al endpoint GET /api/productos/{id}
        fetch(`http://localhost:8080/api/productos/${id}`)
            .then(response => {
                if (!response.ok) throw new Error('Producto no encontrado o error de servidor');
                return response.json();
            })
            .then(data => {
                setProducto(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', padding: '30px' }}>Cargando detalle...</div>;

    if (error || !producto) {
        return (
            <div style={{ textAlign: 'center', padding: '30px' }}>
                <h2>{error || 'Producto no encontrado'}</h2>
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
                ${producto.precio?.toLocaleString()}
            </p>
            <button className="btn-onoff" onClick={() => navigate(-1)}>
                Volver
            </button>
        </div>
    );
};

export default ProductDetail;