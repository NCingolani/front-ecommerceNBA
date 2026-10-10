import React, { useState } from 'react';

const ProductCreate = () => {
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [mensaje, setMensaje] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const nuevoProducto = {
            nombre,
            precio: parseFloat(precio),
            descripcion
        };

        // 3er Componente que llama al endpoint POST /api/productos
        // Requiere estar autenticado y tener rol ADMIN según tu SecurityConfig
        const token = localStorage.getItem('token'); // Asumiendo que guardas el JWT aquí

        fetch('http://localhost:8080/api/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Aquí se envía el token
            },
            body: JSON.stringify(nuevoProducto)
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al crear el producto. ¿Eres Admin?');
            return response.json();
        })
        .then(data => {
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
                <button type="submit" className="btn-onoff">
                    Guardar Producto
                </button>
            </form>
        </div>
    );
};

export default ProductCreate;
