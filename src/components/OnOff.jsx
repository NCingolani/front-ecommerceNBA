import React, { useState } from 'react';

const OnOff = ({ onToggle, activo }) => {
    const [encendidoInterno, setEncendidoInterno] = useState(false);
    const encendido = typeof activo === 'boolean' ? activo : encendidoInterno;

    const toggleEstado = () => {
        const nuevoEstado = !encendido;
        setEncendidoInterno(nuevoEstado);
        
        if (onToggle) {
            onToggle(nuevoEstado);
        }
    };

    return (
        <button className={`btn-onoff ${encendido ? 'activo' : ''}`} onClick={toggleEstado}>
            {encendido ? ' Modo Oscuro: OFF' : ' Modo Oscuro: ON'}
        </button>
    );
};

export default OnOff;