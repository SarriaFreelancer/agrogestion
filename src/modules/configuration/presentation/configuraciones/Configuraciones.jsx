import React, { useState, useRef } from 'react';
import { useAgro } from '@/providers/AgroContext';
import { Switch } from '@/components/ui/Switch';
import { 
  Building2, 
  ShieldCheck, 
  Database, 
  UploadCloud, 
  FlaskConical, 
  Package, 
  Tractor, 
  Users, 
  Microscope, 
  Layers, 
  BookOpen, 
  Palette, 
  Settings, 
  Server, 
  ClipboardList, 
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Globe,
  Satellite,
  Download,
  FileSpreadsheet,
  Check,
  Trash2,
  Play,
  FileText
} from 'lucide-react';

export default function Configuraciones() {
  const { 
    currentClient, 
    configuraciones, 
    updateConfiguracion, 
    currentUser, 
    updateClient, 
    clients, 
    setCurrentClient, 
    THEME_CONFIG,
    setSectores,
    setProductos,
    setMaquinarias,
    setTrabajadores,
    setActividades,
    setPlanificaciones,
    setRegistrosControles,
    addAuditLog
  } = useAgro();

  const isAdminUser = currentUser?.rol === 'Super Admin' || currentUser?.rol === 'Administrador' || currentUser?.modulos?.includes('ALL');

  const [activeTab, setActiveTab] = useState('monitoreo');
  const [aiTestStatus, setAiTestStatus] = useState(null);
  const [aiTesting, setAiTesting] = useState(false);

  // Importación Masiva State
  const [importType, setImportType] = useState('insumos');
  const [importedData, setImportedData] = useState([]);
  const [importFileName, setImportFileName] = useState('');
  const [importSuccessMessage, setImportSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  // Toast / notification state for actions
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const isEnabled = (val) => Number(val) === 1;

  const handleToggle = (key) => {
    const currentValue = configuraciones[key];
    const nextValue = Number(currentValue) === 1 ? 0 : 1;
    updateConfiguracion(key, nextValue);
    if (addAuditLog) {
      addAuditLog({
        usuario: currentUser?.nombre || 'Administrador',
        accion: `Cambio de configuración: ${key} -> ${nextValue === 1 ? 'ON' : 'OFF'}`,
        modulo: 'Configuraciones'
      });
    }
  };

  const handleLevelNameChange = (key, value) => {
    updateConfiguracion('estructuraNivelNombres', {
      ...configuraciones.estructuraNivelNombres,
      [key]: value
    });
  };

  const handleEstructuraNivelesChange = (value) => {
    updateConfiguracion('estructuraNiveles', Number(value));
  };

  const handleThemeChange = (newTheme) => {
    const clientKey = Object.keys(clients || {}).find(k => (clients[k]?.id || k) === currentClient.id);
    if (clientKey && typeof updateClient === 'function') {
      updateClient(clientKey, currentClient.plan, currentClient.modules, newTheme);
    }
    if (typeof setCurrentClient === 'function') {
      setCurrentClient({ ...currentClient, theme: newTheme });
    }
    if (typeof updateConfiguracion === 'function') {
      updateConfiguracion('tema', newTheme);
    }
  };

  // ── CSV TEMPLATE DOWNLOADER ─────────────────────────────────────────────
  const downloadTemplate = (type) => {
    let headers = '';
    let sampleData = '';
    let filename = '';

    switch (type) {
      case 'estructura':
        filename = 'plantilla_estructura_agricola.csv';
        headers = 'Sector,Finca,Lote,Suerte,Area_Ha,Variedad_Cultivo,Latitud,Longitud\n';
        sampleData = 'Valle Central,Hacienda El Paraíso,Lote Norte,Suerte 1A,12.5,Caña CC 01-1940,3.4516,-76.5320\nValle Central,Hacienda El Paraíso,Lote Sur,Suerte 2B,8.3,Aguacate Hass,3.4528,-76.5342\n';
        break;
      case 'insumos':
        filename = 'plantilla_insumos_productos.csv';
        headers = 'Codigo,Nombre_Comercial,Ingrediente_Activo,Categoria,Unidad_Medida,Stock_Actual,Costo_Unitario_COP\n';
        sampleData = 'INS-001,Urea Granulada 46%,Nitrógeno 46%,Fertilizantes,Kg,500,85000\nINS-002,Glifosato 480 SL,Glifosato,Herbicidas,Litros,120,42000\nINS-003,Micorrizas Bio-Raíz,Glomus intraradices,Bioinsumos,Kg,80,28000\n';
        break;
      case 'trabajadores':
        filename = 'plantilla_mano_de_obra.csv';
        headers = 'Codigo,Nombre_Completo,Documento_Identidad,Cargo,Cuadrilla,Telefono,Estado\n';
        sampleData = 'MO-101,Carlos Julio Restrepo,1144123456,Operario de Riego,Cuadrilla A,3101234567,Activo\nMO-102,María Eugenia Gómez,66890123,Aplicadora Fitosanitaria,Cuadrilla B,3159876543,Activo\n';
        break;
      case 'maquinaria':
        filename = 'plantilla_parque_maquinaria.csv';
        headers = 'Codigo,Nombre_Equipo,Tipo_Maquinaria,Marca,Modelo,Tarifa_Hora_COP,Horometro_Actual,Estado\n';
        sampleData = 'MAQ-01,Tractor John Deere 6125M,Tractor Agricola,John Deere,2023,120000,1450.5,Operativo\nMAQ-02,Pulverizadora Jacto Advance,Fumigadora,Jacto,2022,85000,820.0,Operativo\n';
        break;
      case 'actividades':
        filename = 'plantilla_catalogo_actividades.csv';
        headers = 'Codigo,Nombre_Labor,Grupo_Actividad,Cultivo_Destino,Unidad_Medida,Tarifa_Jornal_COP\n';
        sampleData = 'ACT-01,Fertilización edáfica manual,Fertilizacion,Caña de Azucar,Hectareas,65000\nACT-02,Poda sanitaria de formación,Labores Culturales,Aguacate Hass,Plantas,55000\n';
        break;
      case 'monitoreo':
        filename = 'plantilla_monitoreo_fitosanitario.csv';
        headers = 'Fecha,Suerte_Id,Blanco_Biologico,Tipo_Plaga_Enfermedad,Incidencia_Porcentaje,Severidad_Nivel,Latitud,Longitud,Observaciones\n';
        sampleData = '2026-10-07,SUERTE-01,Diatraea saccharalis,Barrenador del Tallo,4.5,Baja,3.4516,-76.5320,Monitoreo preventivo semanal\n';
        break;
      default:
        return;
    }

    const blob = new Blob([headers + sampleData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Plantilla "${filename}" descargada correctamente.`);
  };

  // ── CSV FILE UPLOAD & PARSER ──────────────────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        showToast('El archivo está vacío o solo contiene encabezados.');
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });
        return rowObj;
      });
      setImportedData(rows);
      showToast(`Archivo "${file.name}" cargado con éxito. ${rows.length} filas listas para importar.`);
    };
    reader.readAsText(file);
  };

  const executeCsvImport = () => {
    if (importedData.length === 0) {
      showToast('Por favor cargue un archivo CSV primero.');
      return;
    }

    if (importType === 'insumos' && setProductos) {
      setProductos(prev => {
        const newItems = importedData.map((row, idx) => ({
          id: row.Codigo || `INS-${Date.now()}-${idx}`,
          codigo: row.Codigo || `INS-${idx}`,
          nombre: row.Nombre_Comercial || row.Nombre || 'Insumo Importado',
          ingrediente: row.Ingrediente_Activo || '',
          categoria: row.Categoria || 'General',
          unidad: row.Unidad_Medida || 'Kg',
          stock: parseFloat(row.Stock_Actual) || 100,
          costoUnitario: parseFloat(row.Costo_Unitario_COP) || 10000
        }));
        return [...prev, ...newItems];
      });
    } else if (importType === 'trabajadores' && setTrabajadores) {
      setTrabajadores(prev => {
        const newItems = importedData.map((row, idx) => ({
          id: row.Codigo || `MO-${Date.now()}-${idx}`,
          codigo: row.Codigo || `MO-${idx}`,
          nombre: row.Nombre_Completo || row.Nombre || 'Trabajador',
          cedula: row.Documento_Identidad || '',
          cargo: row.Cargo || 'Operario de Campo',
          cuadrilla: row.Cuadrilla || 'Cuadrilla Principal',
          telefono: row.Telefono || '',
          estado: row.Estado || 'Activo'
        }));
        return [...prev, ...newItems];
      });
    }

    if (addAuditLog) {
      addAuditLog({
        usuario: currentUser?.nombre || 'Administrador',
        accion: `Importación masiva CSV de ${importedData.length} registros en módulo ${importType}`,
        modulo: 'Importación'
      });
    }

    setImportSuccessMessage(`¡Éxito! Se importaron ${importedData.length} registros en el sistema.`);
    setImportedData([]);
    setImportFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Importación completada satisfactoriamente.');
  };

  // ── GENERADOR DE DATOS DE PRUEBA REALES ──────────────────────────────
  const handleLoadFullDemoData = () => {
    // 1. Estructura Agrícola Completa de 6 niveles
    const demoSectores = [
      {
        id: 'SEC-01',
        nombre: 'Valle del Río Cauca (Sector 1)',
        fincas: [
          {
            id: 'FIN-01',
            nombre: 'Hacienda La Manuelita',
            lotes: [
              {
                id: 'LOT-01',
                nombre: 'Lote Cañaduzal Norte',
                suertes: [
                  { 
                    id: 'SUERTE-01', 
                    nombre: 'Suerte 1A - Cenicaña CC 01-1940', 
                    area: 14.5, 
                    cultivo: 'Caña de Azúcar',
                    variedad: 'CC 01-1940',
                    bloque: 'Bloque Hidráulico A',
                    coordenadas: [
                      [3.4510, -76.5310],
                      [3.4550, -76.5310],
                      [3.4550, -76.5350],
                      [3.4510, -76.5350]
                    ]
                  },
                  { 
                    id: 'SUERTE-02', 
                    nombre: 'Suerte 1B - Cenicaña CC 93-4418', 
                    area: 18.2, 
                    cultivo: 'Caña de Azúcar',
                    variedad: 'CC 93-4418',
                    bloque: 'Bloque Hidráulico A',
                    coordenadas: [
                      [3.4550, -76.5310],
                      [3.4590, -76.5310],
                      [3.4590, -76.5350],
                      [3.4550, -76.5350]
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'FIN-02',
            nombre: 'Hacienda El Paraíso',
            lotes: [
              {
                id: 'LOT-02',
                nombre: 'Lote Frutales de Exportación',
                suertes: [
                  { 
                    id: 'SUERTE-03', 
                    nombre: 'Suerte 2A - Aguacate Hass Export', 
                    area: 9.8, 
                    cultivo: 'Aguacate Hass',
                    variedad: 'Hass Criollo',
                    bloque: 'Bloque Goteo 1',
                    coordenadas: [
                      [3.4510, -76.5350],
                      [3.4550, -76.5350],
                      [3.4550, -76.5390],
                      [3.4510, -76.5390]
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'SEC-02',
        nombre: 'Eje Cafetero y Cordillera (Sector 2)',
        fincas: [
          {
            id: 'FIN-03',
            nombre: 'Finca La Esperanza',
            lotes: [
              {
                id: 'LOT-03',
                nombre: 'Lote Cafetal Castillo',
                suertes: [
                  { 
                    id: 'SUERTE-04', 
                    nombre: 'Suerte 3A - Café Castillo Naranjal', 
                    area: 7.2, 
                    cultivo: 'Café',
                    variedad: 'Castillo 2.0',
                    bloque: 'Bloque Ladera',
                    coordenadas: [
                      [3.4550, -76.5350],
                      [3.4590, -76.5350],
                      [3.4590, -76.5390],
                      [3.4550, -76.5390]
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    // 2. Insumos y Productos
    const demoProductos = [
      { id: 'INS-01', codigo: 'INS-01', nombre: 'Urea Granulada 46% N', ingrediente: 'Nitrógeno 46%', categoria: 'Fertilizantes', unidad: 'Kg', stock: 1250, costoUnitario: 85000 },
      { id: 'INS-02', codigo: 'INS-02', nombre: 'DAP Fosfato Diamónico 18-46-0', ingrediente: 'N-P', categoria: 'Fertilizantes', unidad: 'Kg', stock: 800, costoUnitario: 110000 },
      { id: 'INS-03', codigo: 'INS-03', nombre: 'Cloruro de Potasio (KCl)', ingrediente: 'Potasio 60%', categoria: 'Fertilizantes', unidad: 'Kg', stock: 950, costoUnitario: 95000 },
      { id: 'INS-04', codigo: 'INS-04', nombre: 'Glifosato 480 SL', ingrediente: 'Glifosato', categoria: 'Herbicidas', unidad: 'Litros', stock: 350, costoUnitario: 42000 },
      { id: 'INS-05', codigo: 'INS-05', nombre: 'Lorsban 4EC', ingrediente: 'Clorpirifos', categoria: 'Insecticidas', unidad: 'Litros', stock: 120, costoUnitario: 78000 },
      { id: 'INS-06', codigo: 'INS-06', nombre: 'Bio-Trichoderma Harzianum', ingrediente: 'Trichoderma', categoria: 'Bioinsumos', unidad: 'Kg', stock: 180, costoUnitario: 35000 }
    ];

    // 3. Maquinaria
    const demoMaquinaria = [
      { id: 'MAQ-01', codigo: 'MAQ-01', nombre: 'Tractor John Deere 6125M', tipo: 'Tractor Agrícola', marca: 'John Deere', tarifa: 135000, estado: 'Operativo', horometro: 1420.5 },
      { id: 'MAQ-02', codigo: 'MAQ-02', nombre: 'Tractor New Holland TT4.75', tipo: 'Tractor Agrícola', marca: 'New Holland', tarifa: 98000, estado: 'Operativo', horometro: 980.0 },
      { id: 'MAQ-03', codigo: 'MAQ-03', nombre: 'Cosechadora Case IH Austoft 8810', tipo: 'Cosechadora', marca: 'Case IH', tarifa: 320000, estado: 'Operativo', horometro: 3100.0 },
      { id: 'MAQ-04', codigo: 'MAQ-04', nombre: 'Pulverizadora Autopropulsada Jacto', tipo: 'Fumigadora', marca: 'Jacto', tarifa: 180000, estado: 'Operativo', horometro: 650.0 }
    ];

    // 4. Trabajadores
    const demoTrabajadores = [
      { id: 'TRA-01', codigo: 'TRA-01', nombre: 'Carlos Andrés Restrepo', cedula: '1144123456', cargo: 'Operador de Maquinaria Pesada', cuadrilla: 'Cuadrilla Mecanizada', estado: 'Activo' },
      { id: 'TRA-02', codigo: 'TRA-02', nombre: 'Jorge Iván Caicedo', cedula: '1130987654', cargo: 'Supervisor Agronómico de Campo', cuadrilla: 'Cuadrilla Técnica', estado: 'Activo' },
      { id: 'TRA-03', codigo: 'TRA-03', nombre: 'María Eugenia Gómez', cedula: '66890123', cargo: 'Técnica de Sanidad Vegetal', cuadrilla: 'Sanidad & Monitoreo', estado: 'Activo' },
      { id: 'TRA-04', codigo: 'TRA-04', nombre: 'Luis Fernando Mosquera', cedula: '94567890', cargo: 'Operario de Riego y Drenaje', cuadrilla: 'Cuadrilla de Riego', estado: 'Activo' }
    ];

    // 5. Planificaciones / Órdenes de Trabajo con Geofence
    const demoPlanificaciones = [
      {
        id: 'PLAN-2026-001',
        actividad: 'Fertilización edáfica mecanizada',
        suerteId: 'SUERTE-01',
        suerteNombre: 'Suerte 1A - Cenicaña CC 01-1940',
        fecha: new Date().toISOString().split('T')[0],
        areaPlanificada: 14.5,
        areaEjecutada: 14.5,
        estado: 'Completada',
        latitud: 3.4530,
        longitud: -76.5330,
        validoGeocerca: true,
        maquinaria: 'Tractor John Deere 6125M',
        operador: 'Carlos Andrés Restrepo'
      },
      {
        id: 'PLAN-2026-002',
        actividad: 'Poda sanitaria y aclareo',
        suerteId: 'SUERTE-03',
        suerteNombre: 'Suerte 2A - Aguacate Hass Export',
        fecha: new Date().toISOString().split('T')[0],
        areaPlanificada: 9.8,
        areaEjecutada: 6.2,
        estado: 'En Progreso',
        latitud: 3.4528,
        longitud: -76.5365,
        validoGeocerca: true,
        operador: 'Jorge Iván Caicedo'
      }
    ];

    // 6. Monitoreo Fitosanitario
    const demoMonitoreos = [
      {
        id: 'MON-2026-001',
        suerteId: 'SUERTE-01',
        suerteNombre: 'Suerte 1A - Cenicaña CC 01-1940',
        fecha: new Date().toISOString().split('T')[0],
        plaga: 'Diatraea saccharalis (Barrenador)',
        incidencia: 3.8,
        severidad: 'Baja',
        latitud: 3.4525,
        longitud: -76.5328,
        validoGeocerca: true,
        inspector: 'María Eugenia Gómez',
        observaciones: 'Nivel poblacional bajo control biológico.'
      },
      {
        id: 'MON-2026-002',
        suerteId: 'SUERTE-03',
        suerteNombre: 'Suerte 2A - Aguacate Hass Export',
        fecha: new Date().toISOString().split('T')[0],
        plaga: 'Phytophthora cinnamomi (Tristeza)',
        incidencia: 1.2,
        severidad: 'Muy Baja',
        latitud: 3.4535,
        longitud: -76.5372,
        validoGeocerca: true,
        inspector: 'María Eugenia Gómez',
        observaciones: 'Buen drenaje, sin signos activos de necrosis.'
      }
    ];

    if (setSectores) setSectores(demoSectores);
    if (setProductos) setProductos(demoProductos);
    if (setMaquinarias) setMaquinarias(demoMaquinaria);
    if (setTrabajadores) setTrabajadores(demoTrabajadores);
    if (setPlanificaciones) setPlanificaciones(demoPlanificaciones);
    if (setRegistrosControles) setRegistrosControles(demoMonitoreos);

    if (addAuditLog) {
      addAuditLog({
        usuario: currentUser?.nombre || 'Administrador',
        accion: 'Carga de datos de prueba completos (Demo AgroHolding 6 niveles, GPS, Maquinaria, Labores)',
        modulo: 'Datos de Prueba'
      });
    }

    showToast('¡Datos demo cargados con éxito! Estructura, GIS, maquinaria y labores actualizadas.');
  };

  const handleClearOperationalData = () => {
    if (window.confirm('¿Está seguro de eliminar todas las planificaciones, ejecuciones y monitoreos de prueba? Los maestros se conservarán.')) {
      if (setPlanificaciones) setPlanificaciones([]);
      if (setRegistrosControles) setRegistrosControles([]);
      if (addAuditLog) {
        addAuditLog({
          usuario: currentUser?.nombre || 'Administrador',
          accion: 'Limpieza de datos operativos (Planificaciones y Monitoreo)',
          modulo: 'Datos de Prueba'
        });
      }
      showToast('Datos operativos limpiados correctamente.');
    }
  };

  const handleResetFactory = () => {
    if (window.confirm('⚠️ ATENCIÓN: Esta acción limpiará la memoria local y reiniciará el sistema con los datos de fábrica. ¿Desea continuar?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const menuSections = [
    {
      title: 'CONFIGURACIÓN GENERAL',
      items: [
        { id: 'datos_empresa', label: 'Datos de Empresa', icon: Building2 },
        { id: 'seguridad', label: 'Seguridad & Sesión', icon: ShieldCheck },
        { id: 'ia_satelite', label: 'IA & Satélite Python', icon: Sparkles, highlight: true },
        { id: 'respaldos', label: 'Respaldos y SMTP', icon: Database },
        { id: 'importacion', label: 'Importación Masiva (CSV)', icon: UploadCloud, highlight: true },
        { id: 'datos_prueba', label: 'Datos de Prueba & Demo', icon: FlaskConical, highlight: true }
      ]
    },
    {
      title: 'CONFIGURACIÓN OPERATIVA',
      items: [
        { id: 'insumos', label: 'Insumos', icon: Package },
        { id: 'maquinaria', label: 'Maquinaria', icon: Tractor },
        { id: 'mano_obra', label: 'Mano de Obra', icon: Users },
        { id: 'monitoreo', label: 'Monitoreo', icon: Microscope },
        { id: 'estructura', label: 'Estructura Agrícola', icon: Layers },
        { id: 'maestros', label: 'Maestros', icon: BookOpen },
        { id: 'apariencia', label: 'Apariencia & Tema', icon: Palette },
        { id: 'instancia', label: 'Instancia', icon: Settings }
      ]
    }
  ];

  if (isAdminUser) {
    menuSections.push({
      title: 'GESTIÓN DE INFRAESTRUCTURA',
      items: [
        { id: 'servidores', label: 'Servidores (Inquilinos)', icon: Server },
        { id: 'registros', label: 'Registros del Sistema', icon: ClipboardList }
      ]
    });
  }

  const renderContent = () => {
    // ── MONITOREO ───────────────────────────────────────────────────────
    if (activeTab === 'monitoreo') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl border border-emerald-500/20 shadow-md">
                <Microscope size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Monitoreo Fitosanitario & Suelos</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure las validaciones y parámetros de inspección agronómica en campo</p>
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Monitoreo Activo</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Validación GPS y muestreo dinámico</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: 'monitoreo_gps', label: 'Geolocalización GPS Obligatoria', desc: 'Adjunta coordenadas de alta precisión al muestreo y valida geocerca.', icon: '📍' },
              { id: 'monitoreo_alertas', label: 'Mostrar alertas de umbral de daño económico', desc: 'Resalta en rojo valores de plaga/enfermedad superiores al rango permitido.', icon: '🔔' },
              { id: 'monitoreo_adicionales', label: 'Permitir sub-muestras por punto de control', desc: 'Activa el registro de múltiples sub-muestras por coordenada.', icon: '🧪' },
              { id: 'monitoreo_obs', label: 'Permitir notas y fotos de evidencia', desc: 'Agrega campo de fotografía y observaciones técnicas al formulario.', icon: '📝' },
              { id: 'monitoreo_req', label: 'Variables agronómicas requeridas', desc: 'Impide guardar monitoreo si faltan variables críticas del cultivo.', icon: '⚙️' }
            ].map(opt => {
              const active = isEnabled(configuraciones[opt.id] ?? 1);
              return (
                <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl">
                      {opt.icon}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">{opt.label}</h4>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${active ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'}`}>
                      {active ? 'ACTIVADO' : 'DESACTIVADO'}
                    </span>
                    <Switch 
                      checked={active} 
                      onCheckedChange={() => handleToggle(opt.id)} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── INSUMOS ─────────────────────────────────────────────────────────
    if (activeTab === 'insumos') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-2xl border border-amber-500/20 shadow-md">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Insumos & Inventario</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reglas de salida de bodega, stock mínimo y control de costos</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: 'config_insumos', label: 'Módulo Operativo de Insumos', desc: 'Activa o desactiva la descarga y control de insumos en campo.', icon: '📦' },
              { id: 'validarInsumos', label: 'Obligar Insumos en Aplicaciones', desc: 'Requiere registrar producto y dosis exacta en fertilizaciones y fumigaciones.', icon: '⚠️' },
              { id: 'bloquearStockNegativo', label: 'Bloquear Salidas sin Stock (Stock Negativo)', desc: 'Impide despachos de bodega si no hay inventario físico registrado.', icon: '🛑' },
              { id: 'registrarGpsInsumos', label: 'Registrar Geocerca en Despacho', desc: 'Captura coordenadas del punto de aplicación de insumos en el lote.', icon: '📍' }
            ].map(opt => {
              const active = isEnabled(configuraciones[opt.id] ?? (opt.id === 'config_insumos' ? 1 : 0));
              return (
                <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl">
                      {opt.icon}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">{opt.label}</h4>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${active ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'}`}>
                      {active ? 'ACTIVADO' : 'DESACTIVADO'}
                    </span>
                    <Switch 
                      checked={active} 
                      onCheckedChange={() => handleToggle(opt.id)} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── MAQUINARIA ──────────────────────────────────────────────────────
    if (activeTab === 'maquinaria') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 text-2xl border border-blue-500/20 shadow-md">
              <Tractor size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Maquinaria & Equipos</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Horómetros, combustibles, telemetría y costos mecánicos</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: 'config_maq', label: 'Bloque de Maquinaria y Talleres', desc: 'Activa o desactiva la gestión de parque de maquinaria y aperos.', icon: '🚜' },
              { id: 'validarMaquinaria', label: 'Obligar Asignación de Equipo en Labores Mecánicas', desc: 'Exige seleccionar tractor o apero en aradas, rastrilladas y siembra.', icon: '⚠️' },
              { id: 'registrarGpsMaquinaria', label: 'Telemetría GPS por Jornada', desc: 'Registra coordenadas de inicio y fin de la labor mecanizada.', icon: '📍' }
            ].map(opt => {
              const active = isEnabled(configuraciones[opt.id] ?? (opt.id === 'config_maq' ? 1 : 0));
              return (
                <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 shadow-sm transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl">
                      {opt.icon}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">{opt.label}</h4>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${active ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'}`}>
                      {active ? 'ACTIVADO' : 'DESACTIVADO'}
                    </span>
                    <Switch 
                      checked={active} 
                      onCheckedChange={() => handleToggle(opt.id)} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── MANO DE OBRA ────────────────────────────────────────────────────
    if (activeTab === 'mano_obra') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-2xl border border-indigo-500/20 shadow-md">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Mano de Obra & Cuadrillas</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control de nómina, jornales, tareas al destajo y asistencia</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: 'config_mao', label: 'Bloque de Mano de Obra', desc: 'Activa la liquidación de cuadrillas y trabajadores por labor.', icon: '👥' },
              { id: 'validarNomina', label: 'Obligar Trabajador Responsable', desc: 'Exige asignar el personal que ejecutó la labor en campo.', icon: '📋' },
              { id: 'registrarGpsManoObra', label: 'Marcación Biométrica / GPS de Asistencia', desc: 'Valida que el personal se encuentre dentro de la finca asignada.', icon: '📍' }
            ].map(opt => {
              const active = isEnabled(configuraciones[opt.id] ?? (opt.id === 'config_mao' ? 1 : 0));
              return (
                <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 shadow-sm transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl">
                      {opt.icon}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">{opt.label}</h4>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${active ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'}`}>
                      {active ? 'ACTIVADO' : 'DESACTIVADO'}
                    </span>
                    <Switch 
                      checked={active} 
                      onCheckedChange={() => handleToggle(opt.id)} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── ESTRUCTURA AGRÍCOLA (HASTA 6 NIVELES) ───────────────────────────
    if (activeTab === 'estructura') {
      const nivelesCount = configuraciones.estructuraNiveles || 6;
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl border border-emerald-500/20 shadow-md">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Estructura Jerárquica Agrícola</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configuración de niveles de segregación territorial y unidades productivas</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mb-6">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
              Profundidad de la Jerarquía Territorial
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold"
              value={nivelesCount}
              onChange={(e) => handleEstructuraNivelesChange(e.target.value)}
            >
              {[2, 3, 4, 5, 6].map(level => (
                <option key={level} value={level}>{level} Niveles Jerárquicos {level === 6 ? '(Completo: Sector ➔ Finca ➔ Lote ➔ Suerte ➔ Variedad ➔ Bloque)' : ''}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: nivelesCount }, (_, index) => {
              const defaultNames = ['Sector Geográfico', 'Finca / Predio', 'Lote de Cultivo', 'Suerte / Tablar', 'Variedad / Híbrido', 'Bloque de Riego / Válvula'];
              const key = `nivel${index + 1}`;
              return (
                <div key={key} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Nivel {index + 1}
                    </label>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono">
                      Jerarquía {index + 1}
                    </span>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500"
                    value={configuraciones.estructuraNivelNombres?.[key] || defaultNames[index]}
                    onChange={(e) => handleLevelNameChange(key, e.target.value)}
                    placeholder={defaultNames[index]}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── MAESTROS ────────────────────────────────────────────────────────
    if (activeTab === 'maestros') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 text-2xl border border-purple-500/20 shadow-md">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Catálogos Maestros</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Active o desactive módulos maestros según la operación de su agroindustria</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'maestro_actividad', label: 'Actividades & Labores', icon: '📝' },
              { id: 'maestro_maq', label: 'Parque de Maquinaria', icon: '🚜' },
              { id: 'maestro_mao', label: 'Trabajadores & Cuadrillas', icon: '👥' },
              { id: 'maestro_ins', label: 'Productos & Fertilizantes', icon: '📦' },
              { id: 'maestro_proveedores', label: 'Proveedores & Contratistas', icon: '🏢' },
              { id: 'maestro_cultivos', label: 'Cultivos & Fenología', icon: '🌱' },
              { id: 'maestro_controles', label: 'Controles Fitosanitarios', icon: '🔬' },
              { id: 'maestro_tp_act', label: 'Grupos de Actividad', icon: '🗂️' },
              { id: 'maestro_tipos_maquinaria', label: 'Tipos de Maquinaria', icon: '⚙️' },
              { id: 'maestro_cuadrillas', label: 'Cuadrillas de Campo', icon: '🧑‍🤝‍🧑' },
              { id: 'maestro_unidades', label: 'Unidades de Medida', icon: '📏' },
              { id: 'maestro_tipos_productos', label: 'Tipos de Productos', icon: '🔖' }
            ].map(maestro => {
              const active = isEnabled(configuraciones[maestro.id] ?? 1);
              return (
                <div key={maestro.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{maestro.icon}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{maestro.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${active ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                      {active ? 'ON' : 'OFF'}
                    </span>
                    <Switch 
                      checked={active} 
                      onCheckedChange={() => handleToggle(maestro.id)} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── IMPORTACIÓN MASIVA (CSV) ────────────────────────────────────────
    if (activeTab === 'importacion') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl border border-emerald-500/20 shadow-md">
                <UploadCloud size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Importación Masiva de Datos</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Cargue fácilmente planillas CSV o Excel a cualquier catálogo del sistema</p>
              </div>
            </div>
          </div>

          {/* Plantillas Descargables */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download size={16} className="text-emerald-500" />
              1. Descargar Plantillas Oficiales (CSV)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { id: 'estructura', label: 'Estructura Agrícola', icon: '🗺️', desc: 'Sectores, fincas, lotes, suertes' },
                { id: 'insumos', label: 'Insumos / Fertilizantes', icon: '📦', desc: 'Stock, precios, ingredientes' },
                { id: 'trabajadores', label: 'Personal y Cuadrillas', icon: '👥', desc: 'Cédula, cargo, cuadrilla' },
                { id: 'maquinaria', label: 'Parque de Maquinaria', icon: '🚜', desc: 'Tarifas, horómetros, tipos' },
                { id: 'actividades', label: 'Catálogo de Labores', icon: '📝', desc: 'Jornales, grupos, cultivos' },
                { id: 'monitoreo', label: 'Monitoreo Fitosanitario', icon: '🔬', desc: 'Plagas, coordenadas GPS' }
              ].map(tpl => (
                <div key={tpl.id} className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm flex flex-col justify-between gap-3 transition-all">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{tpl.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{tpl.label}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{tpl.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => downloadTemplate(tpl.id)}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download size={13} />
                    <span>Descargar Plantilla</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Zona de Carga de Archivo */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-emerald-500" />
              2. Subir Archivo CSV con Datos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Módulo Destino de los Datos
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white font-medium"
                  value={importType}
                  onChange={(e) => setImportType(e.target.value)}
                >
                  <option value="insumos">Insumos y Productos</option>
                  <option value="trabajadores">Personal y Mano de Obra</option>
                  <option value="maquinaria">Maquinaria</option>
                  <option value="estructura">Estructura Agrícola</option>
                  <option value="actividades">Actividades</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Seleccionar Archivo (.CSV)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Vista Previa de Datos Importados */}
            {importedData.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Vista previa: {importedData.length} registros detectados en {importFileName}
                  </span>
                  <button
                    onClick={executeCsvImport}
                    className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-2"
                  >
                    <Check size={14} />
                    <span>Ejecutar Importación Ahora</span>
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase text-[10px]">
                      <tr>
                        {Object.keys(importedData[0] || {}).map((col, idx) => (
                          <th key={idx} className="p-2 border-b border-slate-200 dark:border-slate-700">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {importedData.slice(0, 5).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="p-2 text-slate-800 dark:text-slate-200">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importedData.length > 5 && (
                    <div className="p-2 text-center text-slate-400 text-[11px] bg-slate-50 dark:bg-slate-800/30">
                      ... y {importedData.length - 5} registros más
                    </div>
                  )}
                </div>
              </div>
            )}

            {importSuccessMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{importSuccessMessage}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── DATOS DE PRUEBA & DEMO ──────────────────────────────────────────
    if (activeTab === 'datos_prueba') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 text-2xl border border-purple-500/20 shadow-md">
              <FlaskConical size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Generador de Datos de Prueba</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Inyecte datasets agrícolas reales o limpie la base de datos para pruebas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cargar Demo Completo */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl">
                  🚀
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Cargar Agro-Holding Completo</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Genera una estructura de 6 niveles (Caña de Azúcar, Aguacate Hass, Café), insumos con inventario, cuadrillas, maquinaria con horómetros, órdenes con geocercas GPS y registros fitopatológicos.
                </p>
              </div>
              <button
                onClick={handleLoadFullDemoData}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <Play size={14} />
                <span>Inyectar Dataset Agrícola</span>
              </button>
            </div>

            {/* Limpiar Datos Operativos */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xl">
                  🧹
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Limpiar Órdenes y Monitoreo</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Elimina todas las órdenes de trabajo planificadas, ejecuciones y monitoreos de campo registrados. Conserva intactos todos los catálogos y la estructura agrícola.
                </p>
              </div>
              <button
                onClick={handleClearOperationalData}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 size={14} />
                <span>Limpiar Operaciones</span>
              </button>
            </div>

            {/* Restaurar Fábrica */}
            <div className="bg-white dark:bg-slate-900/60 border border-red-500/20 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between md:col-span-2">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center text-xl">
                    🔄
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-red-500">Restauración de Fábrica</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Borra la memoria local de la sesión activa y reinicia la plataforma a su estado inicial.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleResetFactory}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw size={14} />
                <span>Restaurar Valores de Fábrica</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ── IA & SATÉLITE PYTHON ────────────────────────────────────────────
    if (activeTab === 'ia_satelite') {
      const handleTestAiConnection = async () => {
        setAiTesting(true);
        try {
          const res = await fetch('/api/ai/health');
          const data = await res.json();
          setAiTestStatus({ success: true, data });
        } catch (err) {
          setAiTestStatus({ success: false, error: err.message });
        } finally {
          setAiTesting(false);
        }
      };

      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl border border-emerald-500/20 shadow-md">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Inteligencia Artificial & Satélite Python</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Microservicio Python para telemetría multiespectral, NDVI e IA agronómica</p>
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Microservicio Python Activo</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Puerto 8000 · Conectado vía Node Gateway</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Estado de Conexión del Motor IA</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Verifica la disponibilidad de endpoints analíticos de visión y NDVI.</p>
              </div>
              <button
                onClick={handleTestAiConnection}
                disabled={aiTesting}
                className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-2"
              >
                <RefreshCw size={14} className={aiTesting ? 'animate-spin' : ''} />
                <span>{aiTesting ? 'Verificando...' : 'Probar Conexión'}</span>
              </button>
            </div>

            {aiTestStatus && (
              <div className={`p-4 rounded-xl border text-xs ${aiTestStatus.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-300'}`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {aiTestStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{aiTestStatus.success ? 'Conexión Exitosa con el Motor Python (Puerto 8000)' : 'Fallo de Conexión'}</span>
                </div>
                {aiTestStatus.success && (
                  <pre className="mt-2 p-2 rounded bg-slate-900 text-[11px] overflow-x-auto text-emerald-400 font-mono">
                    {JSON.stringify(aiTestStatus.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── APARIENCIA & TEMA ───────────────────────────────────────────────
    if (activeTab === 'apariencia') {
      const themes = [
        { id: 'Verde Agro', label: 'Verde Agro', desc: 'Inspirado en la naturaleza y el crecimiento agrícola.', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop' },
        { id: 'Azul Océano', label: 'Azul Océano', desc: 'Transmite confianza, estabilidad y profundidad.', img: 'https://images.unsplash.com/photo-1498623116890-37e912163d5d?q=80&w=800&auto=format&fit=crop' },
        { id: 'Tierra Café', label: 'Tierra Café', desc: 'Conexión con la tierra, calidez y naturalidad.', img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop' },
        { id: 'Púrpura Real', label: 'Púrpura Real', desc: 'Elegancia, sofisticación y liderazgo.', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop' },
        { id: 'Naranja Atardecer', label: 'Naranja Atardecer', desc: 'Energía, creatividad y optimismo.', img: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800&auto=format&fit=crop' },
        { id: 'Gris Carbón', label: 'Gris Carbón', desc: 'Modernidad, equilibrio y profesionalismo.', img: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=800&auto=format&fit=crop' }
      ];

      return (
        <div className="space-y-6 w-full max-w-5xl fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl border border-emerald-500/20 shadow-md">
                <Palette size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Apariencia & Personalización</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Seleccione el esquema de color y la base visual de la plataforma</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 flex items-center justify-between shadow-sm">
            <div>
              <h4 className="text-[15px] font-bold text-slate-900 dark:text-white">Modo Claro / Oscuro</h4>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Alterna la paleta general manteniendo la visibilidad y alto contraste.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold ${configuraciones.modoOscuro === 0 ? 'text-emerald-600' : 'text-slate-400'}`}>Claro</span>
              <Switch 
                checked={configuraciones.modoOscuro !== 0} 
                onCheckedChange={() => handleToggle('modoOscuro')} 
              />
              <span className={`text-xs font-bold ${configuraciones.modoOscuro !== 0 ? 'text-emerald-500' : 'text-slate-400'}`}>Oscuro</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {themes.map(theme => {
              const isActive = currentClient.theme === theme.id || (theme.id === 'Verde Agro' && !currentClient.theme);
              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`relative text-left rounded-xl overflow-hidden border transition-all duration-300 group
                    ${isActive 
                      ? 'border-emerald-500 ring-2 ring-emerald-500 shadow-lg bg-white dark:bg-slate-900' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-700'
                    }
                  `}
                >
                  <div className="h-32 w-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                    <img src={theme.img} alt={theme.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {isActive && (
                      <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-lg">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-4 relative z-20">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{theme.label}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 min-h-[36px]">{theme.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {isActive ? 'Tema Activo' : 'Seleccionar'}
                      </span>
                      <div className="w-10 h-4 rounded shadow-sm border border-black/20" style={{ backgroundColor: THEME_CONFIG?.[theme.id]?.primary || '#10b981' }}></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // ── DATOS DE EMPRESA ────────────────────────────────────────────────
    if (activeTab === 'datos_empresa') {
      return (
        <div className="space-y-6 w-full max-w-4xl fade-in">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl border border-emerald-500/20">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Datos de Empresa</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Información corporativa y parámetros regionales</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            {[
              { key: 'empresa', label: 'Razón Social / Organización', placeholder: 'Ej: Ingenio Agrícola de Occidente' },
              { key: 'pais', label: 'País', placeholder: 'Ej: Colombia' },
              { key: 'zonaHoraria', label: 'Zona Horaria', placeholder: 'Ej: America/Bogota' },
              { key: 'moneda', label: 'Moneda Operativa', placeholder: 'Ej: COP ($)' },
              { key: 'unidadArea', label: 'Unidad de Superficie', placeholder: 'Ej: Hectáreas (Ha)' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">{field.label}</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                  placeholder={field.placeholder}
                  value={configuraciones[field.key] || ''}
                  onChange={e => updateConfiguracion(field.key, e.target.value)}
                />
              </div>
            ))}
            <div className="pt-2">
              <button className="btn-primary !py-2.5 !px-5 text-xs font-bold" onClick={() => showToast('Datos de empresa guardados correctamente')}>
                💾 Guardar Parámetros Corporativos
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ── FALLBACK ────────────────────────────────────────────────────────
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <Settings size={36} className="text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Seleccione una sección</h3>
          <p className="text-xs text-slate-500">Configure los módulos operativos desde el menú lateral.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full fade-in gap-5 p-0 bg-transparent">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Submenu Lateral de Configuración */}
      <div className="w-[280px] border-r border-slate-200 dark:border-slate-800 flex-shrink-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col h-full overflow-hidden shadow-sm">
        <div className="px-6 py-6 shrink-0 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Configuración</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Parámetros del Sistema</p>
        </div>

        <div className="px-3 py-4 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 px-3 mb-1">
                {section.title}
              </h3>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                        isActive 
                          ? 'bg-emerald-600 text-white shadow-md font-bold' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative p-6 lg:p-10">
        {renderContent()}
      </div>
    </div>
  );
}
