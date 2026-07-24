import React, { useState } from 'react';
import Inicio from './Inicio';
import Productos from './Productos'; // Ajusta si tu archivo se llama distinto
import Clientes from './Clientes';
import Proveedores from './Proveedores';
import Ventas from './Ventas';

function App() {
  const [pestanaActiva, setPestanaActiva] = useState('inicio');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Header / Barra de Navegación Superior */}
        <header className="bg-white rounded-2xl shadow-md p-6 border border-slate-200/80">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 flex items-center gap-2">
                <span>🛠️</span> Ferretería <span className="text-amber-600">"El Tornillo Feliz"</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Sistema dinámico conectado a MySQL (XAMPP).
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API Conectada
            </div>
          </div>

          {/* Botones de Navegación por Pestañas */}
          <nav className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setPestanaActiva('inicio')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                pestanaActiva === 'inicio'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🏠 Inicio / Panel
            </button>
            <button
              onClick={() => setPestanaActiva('productos')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                pestanaActiva === 'productos'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📦 Gestión de Productos
            </button>
            <button
              onClick={() => setPestanaActiva('clientes')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                pestanaActiva === 'clientes'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              👥 Gestión de Clientes
            </button>
            <button
              onClick={() => setPestanaActiva('proveedores')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                pestanaActiva === 'proveedores'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🏢 Gestión de Proveedores
            </button>
            <button
              onClick={() => setPestanaActiva('ventas')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                pestanaActiva === 'ventas'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🛒 Registro de Ventas
            </button>
          </nav>
        </header>

        {/* Renderizado Condicional del Contenido */}
        <main>
          {pestanaActiva === 'inicio' && <Inicio />}
          {pestanaActiva === 'productos' && <Productos />}
          {pestanaActiva === 'clientes' && <Clientes />}
          {pestanaActiva === 'proveedores' && <Proveedores />}
          {pestanaActiva === 'ventas' && <Ventas />}
        </main>
      </div>
    </div>
  );
}

export default App;