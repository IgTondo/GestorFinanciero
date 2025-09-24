// src/GastoList.js

import React from 'react';

const GastoList = ({ gastos }) => {
    return (
        <div>
            <h2>Lista de Gastos</h2>
            <ul>
                {gastos.map((gasto) => (
                    <li key={gasto.id}>
                        {gasto.descripcion} - ${gasto.monto} - {gasto.fecha}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GastoList;