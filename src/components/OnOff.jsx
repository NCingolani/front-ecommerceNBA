import React, { useState } from 'react';

const OnOff = ({ onToggle }) => {
    const [encendido, setEncendido] = useState(false);

    const toggleEstado = () => {
        const nuevoEstado = !encendido;
        setEncendido(nuevoEstado);
        
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