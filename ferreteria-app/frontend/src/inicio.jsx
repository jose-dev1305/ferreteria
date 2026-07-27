import React, { useEffect, useState } from 'react';

function Inicio() {
  const [stats, setStats] = useState({
    productos: 0,
    clientes: 0,
    proveedores: 0,
    ventas: 0
  });

  // Cargar estadísticas en tiempo real desde la API
  useEffect(() => {
    Promise.all([
      fetch('http://backend-production-4d48.up.railway.app/api/productos').then((res) => res.json()),
      fetch('http://backend-production-4d48.up.railway.app/api/clientes').then((res) => res.json()),
      fetch('http://backend-production-4d48.up.railway.app/api/proveedores').then((res) => res.json()),
      fetch('http://backend-production-4d48.up.railway.app/api/ventas').then((res) => res.json())
    ])
      .then(([prod, cli, prov, vta]) => {
        setStats({
          productos: Array.isArray(prod) ? prod.length : 0,
          clientes: Array.isArray(cli) ? cli.length : 0,
          proveedores: Array.isArray(prov) ? prov.length : 0,
          ventas: Array.isArray(vta) ? vta.length : 0
        });
      })
      .catch((err) => console.error('Error cargando métricas del sistema:', err));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Banner Principal de Bienvenida (Estilo Industrial Moderno) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-8 md:p-12 shadow-xl border border-slate-800">
        <div className="absolute -right-6 -bottom-6 opacity-10 text-9xl select-none">
          🛠️
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-4 shadow-sm">
            Panel de Control General
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Ferretería <span className="text-amber-400">ProSystem</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg mb-6 leading-relaxed">
            Bienvenido al sistema integral de administración. Controla tu inventario, directorio de proveedores, cartera de clientes y transacciones de venta con máxima eficiencia.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-lg text-sm shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-200 font-medium">XAMPP MySQL Conectado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Tarjetas de Métricas / Estadísticas */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          📊 Resumen de Indicadores
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tarjeta Productos */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Productos</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{stats.productos}</h3>
              </div>
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl text-2xl shadow-sm">
                📦
              </div>
            </div>
          </div>

          {/* Tarjeta Clientes */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Clientes</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{stats.clientes}</h3>
              </div>
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl text-2xl shadow-sm">
                👥
              </div>
            </div>
          </div>

          {/* Tarjeta Proveedores */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Proveedores</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{stats.proveedores}</h3>
              </div>
              <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl text-2xl shadow-sm">
                🏢
              </div>
            </div>
          </div>

          {/* Tarjeta Ventas */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500 hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Ventas</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{stats.ventas}</h3>
              </div>
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl text-2xl shadow-sm">
                🛒
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Módulos del Sistema / Accesos Rápidos */}
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          🚀 Módulos Disponibles en el Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Inventario de Productos</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Registra, modifica precios, revisa existencias en stock y vincula cada artículo con su respectivo proveedor empresarial.
            </p>
            <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Gestión Activa
            </span>
          </div>

          <div className="p-6 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
            <div className="text-3xl mb-3">🛒</div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Registro de Ventas</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Realiza transacciones agregando múltiples productos a la vez de forma dinámica mediante un carrito interactivo y organizado.
            </p>
            <span className="inline-block text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Múltiples Productos
            </span>
          </div>

          <div className="p-6 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
            <div className="text-3xl mb-3">🏢</div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Directorio de Proveedores</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Administra la base de datos de socios comerciales, números telefónicos y direcciones fiscales de manera centralizada.
            </p>
            <span className="inline-block text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Control Total
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inicio;