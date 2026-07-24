import React, { useEffect, useState } from 'react';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [idEditando, setIdEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const [formProducto, setFormProducto] = useState({
    nombre: '',
    precio: '',
    stock: '',
    id_proveedor: ''
  });

  // Cargar productos y proveedores desde la API
  const cargarDatos = () => {
    fetch('http://localhost:3000/api/productos')
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error('Error al cargar productos:', err));

    fetch('http://localhost:3000/api/proveedores')
      .then((res) => res.json())
      .then((data) => setProveedores(data))
      .catch((err) => console.error('Error al cargar proveedores:', err));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Limpiar formulario y cancelar edición
  const resetearFormulario = () => {
    setFormProducto({ nombre: '', precio: '', stock: '', id_proveedor: '' });
    setIdEditando(null);
  };

  // Cargar datos en el formulario para editar
  const handleEditarClick = (prod) => {
    const id = prod.id_producto || prod.id;
    setIdEditando(id);
    setFormProducto({
      nombre: prod.nombre || '',
      precio: prod.precio || '',
      stock: prod.stock || '',
      id_proveedor: prod.id_proveedor || ''
    });
  };

  // Eliminar producto
  const handleEliminarClick = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto del inventario?')) {
      fetch(`http://localhost:3000/api/productos/${id}`, {
        method: 'DELETE'
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message || 'Producto eliminado');
          cargarDatos();
        })
        .catch((err) => console.error('Error al eliminar producto:', err));
    }
  };

  // Guardar o actualizar producto
  const handleProductoSubmit = (e) => {
    e.preventDefault();

    const esEdicion = idEditando !== null;
    const url = esEdicion
      ? `http://localhost:3000/api/productos/${idEditando}`
      : 'http://localhost:3000/api/productos';
    const method = esEdicion ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formProducto)
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || (esEdicion ? 'Producto actualizado' : 'Producto registrado'));
        resetearFormulario();
        cargarDatos();
      })
      .catch((err) => console.error('Error al procesar producto:', err));
  };

  // Filtrar productos según la barra de búsqueda
  const productosFiltrados = productos.filter((prod) => {
    const texto = busqueda.toLowerCase();
    const nombreProd = (prod.nombre || '').toLowerCase();
    const nombreProv = (prod.proveedor || '').toLowerCase();
    return nombreProd.includes(texto) || nombreProv.includes(texto);
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12 w-full text-slate-100">
      {/* Formulario Estilo Dark Dashboard */}
      <div className="bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-8 border border-slate-800 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-slate-800 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-3">
              <span className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl text-lg border border-blue-500/30">📦</span> 
              {idEditando ? 'Actualizar Información del Producto' : 'Módulo de Registro de Artículos'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {idEditando ? `Modificando registro ID: #${idEditando}` : 'Complete las especificaciones técnicas para dar de alta un producto en el sistema.'}
            </p>
          </div>
          {idEditando && (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs px-3.5 py-1.5 rounded-lg uppercase tracking-wider">
              Modo Edición Activo
            </span>
          )}
        </div>

        <form onSubmit={handleProductoSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Nombre del producto */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Nombre del Producto
              </label>
              <input
                type="text"
                placeholder="Ej. Taladro Percutor Profesional 500W"
                required
                value={formProducto.nombre}
                onChange={(e) => setFormProducto({ ...formProducto, nombre: e.target.value })}
                className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white font-medium transition-all text-sm"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Precio Unitario ($)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-bold text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={formProducto.precio}
                  onChange={(e) => setFormProducto({ ...formProducto, precio: e.target.value })}
                  className="w-full pl-8 pr-4 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white font-medium transition-all text-sm"
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Cantidad en Stock
              </label>
              <input
                type="number"
                placeholder="Ej. 25"
                required
                value={formProducto.stock}
                onChange={(e) => setFormProducto({ ...formProducto, stock: e.target.value })}
                className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white font-medium transition-all text-sm"
              />
            </div>

            {/* Proveedor */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Empresa Proveedora Asociada
              </label>
              <select
                required
                value={formProducto.id_proveedor}
                onChange={(e) => setFormProducto({ ...formProducto, id_proveedor: e.target.value })}
                className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white font-medium transition-all text-sm"
              >
                <option value="" className="bg-slate-950 text-slate-400">Selecciona una empresa proveedora de la lista</option>
                {proveedores.map((prov) => (
                  <option key={prov.id_proveedor} value={prov.id_proveedor} className="bg-slate-950 text-white">
                    {prov.nombre_empresa}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-800">
            <button
              type="submit"
              className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm ${
                idEditando 
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
              }`}
            >
              <span>{idEditando ? '💾' : '➕'}</span>
              {idEditando ? 'Actualizar Datos del Producto' : 'Guardar Producto en el Inventario'}
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

      {/* Tabla e Inventario con Búsqueda Integrada */}
      <div className="bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-8 border border-slate-800 w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
              <span>📋</span> Inventario General de Artículos
            </h2>
            <p className="text-sm text-slate-400 mt-1">Control avanzado de existencias, costos y proveedores vinculados.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* Barra de Búsqueda */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar producto o proveedor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-medium focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white transition-all"
              />
            </div>

            <div className="bg-blue-600/10 text-blue-400 font-extrabold text-xs px-4 py-3 rounded-xl border border-blue-500/20 text-center">
              Total: {productos.length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">ID</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Precio Unitario</th>
                <th className="p-4">Stock Actual</th>
                <th className="p-4">Proveedor</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/60">
              {productosFiltrados.map((prod) => {
                const idProd = prod.id_producto || prod.id;
                const stockBajo = Number(prod.stock) < 5;
                return (
                  <tr key={idProd} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-slate-500 font-bold">#{idProd}</td>
                    <td className="p-4 font-bold text-white">{prod.nombre}</td>
                    <td className="p-4 font-black text-emerald-400">${Number(prod.precio).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-extrabold ${
                        stockBajo 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {prod.stock} un. {stockBajo && '⚠️'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">{prod.proveedor || 'Sin proveedor'}</td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => handleEditarClick(prod)}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminarClick(idProd)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {productosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 font-medium text-sm">
                    No se encontraron productos coincidentes en el inventario.
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

export default Productos;