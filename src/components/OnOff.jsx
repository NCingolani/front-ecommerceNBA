import React, { useState } from 'react';

const OnOff = () => {
    // Estado inicial: false (no está en el carrito / Off)
    const [encendido, setEncendido] = useState(false);

    // Función que invierte el estado actual
    const toggleEstado = () => {
        setEncendido(!encendido);
    };

    return (
        <button onClick={toggleEstado}>
            {encendido ? '✓ Agregado' : 'Agregar al carrito'}
        </button>
    );
};

export default OnOff;