import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [clienteEditando, setClienteEditando] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', dni: '', telefono: '', email: '' });

  const cargarClientes = async () => {
    try {
      const res = await fetch(`${API_URL}/clientes`);
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleEliminar = async (id) => {
    if (confirm('¿Estás seguro de eliminar este cliente? Se borrarán sus reparaciones.')) {
      await fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE' });
      cargarClientes();
    }
  };

  const handleIniciarEditar = (cliente) => {
    setClienteEditando(cliente.id);
    setFormData({ 
      nombre: cliente.nombre, 
      dni: cliente.dni, 
      telefono: cliente.telefono || '', 
      email: cliente.email || '' 
    });
  };

  const handleGuardarEditar = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/clientes/${clienteEditando}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setClienteEditando(null);
    cargarClientes();
  };

  const clientesFiltrados = clientes.filter((c) => {
    const termino = busqueda.toLowerCase();
    const nombre = c.nombre ? c.nombre.toLowerCase() : '';
    const dni = c.dni ? c.dni.toLowerCase() : '';
    const telefono = c.telefono ? c.telefono.toLowerCase() : '';

    return nombre.includes(termino) || dni.includes(termino) || telefono.includes(termino);
  });

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>👥 Gestión de Clientes</h1>
      </header>

      {/* Formulario de edición en tarjeta */}
      {clienteEditando && (
        <section className="form-section">
          <h2>Editar Cliente</h2>
          <form onSubmit={handleGuardarEditar} className="form-group">
            <input 
              type="text" 
              value={formData.nombre} 
              onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
              placeholder="Nombre" 
              required 
              className="input-field"
            />
            <input 
              type="text" 
              value={formData.dni} 
              onChange={(e) => setFormData({...formData, dni: e.target.value})} 
              placeholder="DNI" 
              required 
              className="input-field"
            />
            <input 
              type="text" 
              value={formData.telefono} 
              onChange={(e) => setFormData({...formData, telefono: e.target.value})} 
              placeholder="Teléfono" 
              className="input-field"
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar Cambios</button>
              <button 
                type="button" 
                onClick={() => setClienteEditando(null)} 
                className="btn-danger" 
                style={{ background: '#444' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Barra de búsqueda */}
      <div className="search-container">
        <input 
          type="text" 
          placeholder="🔍 Buscar por nombre, DNI o teléfono..." 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)} 
          className="input-field search-input"
        />
      </div>

      {/* Lista de clientes con el mismo estilo de tarjetas (repair-card) */}
      <section className="form-section" style={{ marginTop: '1rem' }}>
        <h2>Clientes Registrados</h2>

        {clientesFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
            No se encontraron clientes...
          </p>
        ) : (
          <div className="repair-list">
            {clientesFiltrados.map((c) => (
              <article key={c.id} className="repair-card">
                <div className="repair-info">
                  <h4>{c.nombre} <span className="repair-client">(DNI: {c.dni})</span></h4>
                  <p className="repair-details">
                    📱 Teléfono: {c.telefono || 'Sin registrar'} | 🛠️ Reparaciones asociadas: {c.reparaciones ? c.reparaciones.length : 0}
                  </p>
                </div>

                <div className="repair-controls">
                  <button 
                    onClick={() => handleIniciarEditar(c)} 
                    className="btn-primary" 
                    style={{ padding: '8px 14px', fontSize: '0.9rem' }}
                  >
                    Editar
                  </button>
                  <button onClick={() => handleEliminar(c.id)} className="btn-danger">
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}