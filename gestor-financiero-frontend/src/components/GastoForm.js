// src/GastoForm.js

import React, { useState } from 'react';
import axios from 'axios';

const GastoForm = ({ onGastoAgregado }) => {
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [categoria, setCategoria] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const nuevoGasto = { descripcion, monto, categoria };
            await axios.post('http://localhost:8000/api/gastos/', nuevoGasto);
            onGastoAgregado();
            setDescripcion('');
            setMonto('');
            setCategoria('');
        } catch (error) {
            console.error('Hubo un error al agregar el gasto:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del gasto"
                required
            />
            <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Monto"
                required
            />
            <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Categoría (opcional)"
            />
            <button type="submit">Agregar Gasto</button>
        </form>
    );
};

export default GastoForm;