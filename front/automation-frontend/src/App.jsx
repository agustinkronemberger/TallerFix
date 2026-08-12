import { useState } from 'react';
import { Reparaciones } from './Reparaciones';
import { Clientes } from './Clientes';
import './App.css';

function App() {
  const [vista, setVista] = useState('reparaciones');

  return (
    <div>
      {/* Navegación por Pestañas */}
      <nav style={{ padding: '10px 20px', background: '#222', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setVista('reparaciones')}
          className={`btn-filtro ${vista === 'reparaciones' ? 'activo' : ''}`}
        >
          🛠️ Reparaciones
        </button>
        <button 
          onClick={() => setVista('clientes')}
          className={`btn-filtro ${vista === 'clientes' ? 'activo' : ''}`}
        >
          👥 Clientes
        </button>
      </nav>

      {/* Renderizado Condicional */}
      {vista === 'reparaciones' ? <Reparaciones /> : <Clientes />}
    </div>
  );
}

export default App;