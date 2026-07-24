import React, { useEffect, useState } from 'react';

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [idEditando, setIdEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const [formProveedor, setFormProveedor] = useState({
    nombre_empresa: '',
    telefono: '',
    direccion: ''
  });

  // Cargar proveedores desde la API
  const cargarProveedores = () => {
    fetch('http://localhost:3000/api/proveedores')
      .then((res) => res.json())
      .then((data) => setProveedores(data))
      .catch((err) => console.error('Error al cargar proveedores:', err));
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  // Limpiar formulario y cancelar edición
  const resetearFormulario = () => {
    setFormProveedor({ nombre_empresa: '', telefono: '', direccion: '' });
    setIdEditando(null);
  };

  // Cargar datos en el formulario para editar
  const handleEditarClick = (prov) => {
    const id = prov.id_proveedor || prov.id;
    setIdEditando(id);
    setFormProveedor({
      nombre_empresa: prov.nombre_empresa || '',
      telefono: prov.telefono || '',
      direccion: prov.direccion || ''
    });
  };

  // Eliminar proveedor
  const handleEliminarClick = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      fetch(`http://localhost:3000/api/proveedores/${id}`, {
        method: 'DELETE'
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message || 'Proveedor eliminado');
          cargarProveedores();
        })
        .catch((err) => console.error('Error al eliminar proveedor:', err));
    }
  };

  // Guardar o actualizar proveedor
  const handleProveedorSubmit = (e) => {
    e.preventDefault();

    const esEdicion = idEditando !== null;
    const url = esEdicion
      ? `http://localhost:3000/api/proveedores/${idEditando}`
      : 'http://localhost:3000/api/proveedores';
    const method = esEdicion ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formProveedor)
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || (esEdicion ? 'Proveedor actualizado' : 'Proveedor registrado'));
        resetearFormulario();
        cargarProveedores();
      })
      .catch((err) => console.error('Error al procesar proveedor:', err));
  };

  // Filtrar proveedores según la barra de búsqueda
  const proveedoresFiltrados = proveedores.filter((prov) => {
    const texto = busqueda.toLowerCase();
    const empresa = (prov.nombre_empresa || '').toLowerCase();
    const telefono = (prov.telefono || '').toLowerCase();
    const direccion = (prov.direccion || '').toLowerCase();
    return empresa.includes(texto) || telefono.includes(texto) || direccion.includes(texto);
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12 w-full text-slate-100">
      {/* Formulario Estilo Dark Dashboard */}
      <div className="bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-8 border border-slate-800 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-slate-800 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-3">
              <span className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl text-lg border border-blue-500/30">🏭</span> 
              {idEditando ? 'Actualizar Información del Proveedor' : 'Módulo de Registro de Proveedores'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {idEditando ? `Modificando registro ID: #${idEditando}` : 'Ingrese los datos de la empresa proveedora.'}
            </p>
          </div>
          {idEditando && (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs px-3.5 py-1.5 rounded-lg uppercase tracking-wider">
              Modo Edición Activo
            </span>
          )}
        </div>

        <form onSubmit={handleProveedorSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Nombre de la empresa */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Nombre de la empresa
              </label>
              <input
                type="text"
                placeholder="Nombre de la empresa"
                required
                value={formProveedor.nombre_empresa}
                onChange={(e) => setFormProveedor({ ...formProveedor, nombre_empresa: e.target.value })}
                className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white font-medium transition-all text-sm"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Teléfono
              </label>
              <input
                type="text"
                placeholder="Teléfono"
                required
                value={formProveedor.telefono}
                onChange={(e) => setFormProveedor({ ...formProveedor, telefono: e.target.value })}
                className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white font-medium transition-all text-sm"
              />
            </div>

            {/* Dirección */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Dirección
              </label>
              <input
                type="text"
                placeholder="Dirección"
                required
                value={formProveedor.direccion}
                onChange={(e) => setFormProveedor({ ...formProveedor, direccion: e.target.value })}
                className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white font-medium transition-all text-sm"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-800">
            <button
              type="submit"
              className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm ${
                idEditando 
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30' 
                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/30'
              }`}
            >
              <span>{idEditando ? '💾' : '➕'}</span>
              {idEditando ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
            </button>

            {idEditando && (
              <button
                type="button"
                onClick={resetearFormulario}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors text-sm border border-slate-700"
              >
                Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla y Directorio de Proveedores con Búsqueda Integrada */}
      <div className="bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-8 border border-slate-800 w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
              <span>📋</span> Directorio de Proveedores
            </h2>
            <p className="text-sm text-slate-400 mt-1">Busque, filtre y administre las empresas proveedoras asociadas.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* Barra de Búsqueda */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar empresa, teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-medium focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white transition-all"
              />
            </div>

            <div className="bg-blue-600/10 text-blue-400 font-extrabold text-xs px-4 py-3 rounded-xl border border-blue-500/20 text-center">
              Total: {proveedores.length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">ID</th>
                <th className="p-4">Empresa</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Dirección</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/60">
              {proveedoresFiltrados.map((prov) => {
                const idProv = prov.id_proveedor || prov.id;
                return (
                  <tr key={idProv} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-slate-500 font-bold">#{idProv}</td>
                    <td className="p-4 font-bold text-white">{prov.nombre_empresa}</td>
                    <td className="p-4 text-slate-300 font-medium">{prov.telefono}</td>
                    <td className="p-4 text-slate-300">{prov.direccion}</td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => handleEditarClick(prov)}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminarClick(idProv)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {proveedoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500 font-medium text-sm">
                    No se encontraron proveedores coincidentes en el directorio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Proveedores;