import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const ProductCreate = () => {
    const { session } = useAuth();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [mensaje, setMensaje] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const nuevoProducto = {
            nombre,
            precio: parseFloat(precio),
            descripcion,
            imagen: "/Images/Productos/JerseyLeBronJames.jpg",
            stock: 10,
            talle: "Único"
        };

        const token = session?.token || localStorage.getItem('token');

        fetch('/api/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(nuevoProducto)
        })
            .then(response => {
                if (!response.ok) throw new Error('Error al crear el producto. ¿Eres Admin?');
                return response.json();
            })
            .then(() => {
                setMensaje('Producto creado con éxito!');
                setNombre('');
                setPrecio('');
                setDescripcion('');
            })
            .catch(error => {
                setMensaje(error.message);
            });
    };

    return (
        <div className="product-card" style={{ width: '100%', maxWidth: '450px', margin: '20px auto', textAlign: 'center' }}>
            <h2>Crear Nuevo Producto</h2>
            {mensaje && <p style={{ color: 'red', fontWeight: 'bold' }}>{mensaje}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    required
                    style={{ padding: '8px' }}
                />
                <input
                    type="number"
                    placeholder="Precio"
                    value={precio}
                    onChange={e => setPrecio(e.target.value)}
                    required
                    style={{ padding: '8px' }}
                />
                <textarea
                    placeholder="Descripción"
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    required
                    style={{ padding: '8px' }}
                />
                <button type="submit" className="btn-onoff activo">
                    Guardar Producto
                </button>
                <button type="button" className="btn-onoff" onClick={() => navigate('/productos')}>
                    Volver al Catálogo
                </button>
            </form>
        </div>
    );
};

export default ProductCreate;