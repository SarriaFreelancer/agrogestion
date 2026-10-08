import React, { useState } from 'react';
import { useAgro } from '@/providers/AgroContext';
import { apiUrl } from '@/utils/api';
import { 
  Sparkles, 
  Satellite, 
  Microscope, 
  Droplets, 
  TrendingUp, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Activity, 
  ArrowRight, 
  HelpCircle,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

export default function AgroAICopilot() {
  const { sectores, globalCultivo, globalPlanta } = useAgro();
  const [activeTab, setActiveTab] = useState('ndvi');
  const [loading, setLoading] = useState(false);

  // States for NDVI
  const [ndviForm, setNdviForm] = useState({ suerteId: 'SUERTE-01', areaHa: 15.0, cropType: 'Caña de Azúcar' });
  const [ndviResult, setNdviResult] = useState(null);

  // States for Disease Diagnosis
  const [diagForm, setDiagForm] = useState({ crop: 'Caña de Azúcar', symptoms: 'Pústulas rojizas en el envés de la hoja con halo clorótico' });
  const [diagResult, setDiagResult] = useState(null);

  // States for Smart Irrigation
  const [irrigForm, setIrrigForm] = useState({ crop: 'Caña de Azúcar', soilType: 'Franco-Arcilloso', tempC: 30.5, humidityPct: 62.0, rainForecastMm: 0.0, areaHa: 10.0 });
  const [irrigResult, setIrrigResult] = useState(null);

  // States for Harvest Yield Prediction
  const [yieldForm, setYieldForm] = useState({ crop: 'Caña de Azúcar', areaHa: 20.0, fertilizerKgHa: 240.0 });
  const [yieldResult, setYieldResult] = useState(null);

  // Handlers
  const handleNdviScan = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/ai/ndvi'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ndviForm)
      });
      const data = await res.json();
      setNdviResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnosis = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/ai/diagnose'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diagForm)
      });
      const data = await res.json();
      setDiagResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleIrrigationCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/ai/irrigation-advisory'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(irrigForm)
      });
      const data = await res.json();
      setIrrigResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleYieldPredict = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/ai/yield-prediction'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(yieldForm)
      });
      const data = await res.json();
      setYieldResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7 fade-in p-5 lg:p-8 h-full w-full overflow-y-auto custom-scrollbar bg-transparent">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-500/30 p-6 lg:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-bold text-emerald-300 mb-2">
              <Sparkles size={14} className="text-emerald-400 animate-pulse" />
              <span>Microservicio Python AI + Satélite Activo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Copiloto de Inteligencia Agronómica
            </h1>
            <p className="text-sm text-emerald-100/80 mt-1 max-w-2xl">
              Modelos de visión artificial, telemetría multiespectral NDVI, balance hídrico y predicción de cosechas para maximizar rendimiento y sanidad.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">Motor</span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Python 3.14 + ML
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2.5 p-1.5 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl">
        {[
          { id: 'ndvi', label: 'Satélite & NDVI', icon: Satellite, color: 'text-emerald-400' },
          { id: 'diagnose', label: 'Fitopatología & Plagas', icon: Microscope, color: 'text-purple-400' },
          { id: 'irrigation', label: 'Riego Inteligente', icon: Droplets, color: 'text-blue-400' },
          { id: 'yield', label: 'Predicción de Cosecha', icon: TrendingUp, color: 'text-amber-400' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-contrast)] hover:bg-white/5'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-black' : tab.color} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: NDVI & SATELLITE ANALYSIS ───────────────────────────── */}
      {activeTab === 'ndvi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-card !p-6 space-y-4">
              <h3 className="text-base font-bold text-[var(--text-contrast)] flex items-center gap-2">
                <Satellite size={18} className="text-emerald-400" />
                Parámetros de Escaneo Satelital
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Consulta índices de reflectancia del espectro infrarrojo cercano (NIR) y rojo visible (RED) para medir biomasa y fotosíntesis.
              </p>

              <div className="space-y-3">
                <div className="input-group">
                  <label className="input-label">Cultivo a evaluar</label>
                  <input
                    type="text"
                    className="input-field"
                    value={ndviForm.cropType}
                    onChange={e => setNdviForm({ ...ndviForm, cropType: e.target.value })}
                    placeholder="Ej: Caña de Azúcar, Café, Palma"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Identificador de Suerte / Lote</label>
                  <input
                    type="text"
                    className="input-field"
                    value={ndviForm.suerteId}
                    onChange={e => setNdviForm({ ...ndviForm, suerteId: e.target.value })}
                    placeholder="Ej: SUERTE-104"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Área del polígono (Hectáreas)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    value={ndviForm.areaHa}
                    onChange={e => setNdviForm({ ...ndviForm, areaHa: e.target.value })}
                  />
                </div>

                <button
                  onClick={handleNdviScan}
                  disabled={loading}
                  className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 mt-2"
                >
                  <Sparkles size={16} />
                  <span>{loading ? 'Procesando bandas espectrales...' : 'Ejecutar Análisis Satelital NDVI'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {ndviResult ? (
              <div className="glass-card !p-6 space-y-5 border-emerald-500/30">
                <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Resultado Satelital</span>
                    <h3 className="text-lg font-extrabold text-[var(--text-contrast)]">{ndviResult.interpretation}</h3>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center">
                    <span className="text-[10px] text-emerald-300 font-bold block uppercase">NDVI Promedio</span>
                    <span className="text-2xl font-black text-emerald-400">{ndviResult.averageNdvi}</span>
                  </div>
                </div>

                {/* Progress bars for zoning */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[var(--text-contrast)] uppercase tracking-wider">Distribución de Vigor en Parcela</h4>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-[var(--text-contrast)] mb-1">
                        <span className="text-emerald-400">🌿 Vigor Alto (Fotosíntesis óptima)</span>
                        <span>{ndviResult.zoning?.altoVigorPct}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${ndviResult.zoning?.altoVigorPct}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-[var(--text-contrast)] mb-1">
                        <span className="text-amber-400">🌾 Vigor Moderado</span>
                        <span>{ndviResult.zoning?.medioVigorPct}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${ndviResult.zoning?.medioVigorPct}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-[var(--text-contrast)] mb-1">
                        <span className="text-red-400">⚠️ Estrés Hídrico / Vegetativo</span>
                        <span>{ndviResult.zoning?.estresVegetativoPct}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${ndviResult.zoning?.estresVegetativoPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <h5 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles size={14} /> Prescripción Agronómica Generada por IA:
                  </h5>
                  <ul className="space-y-1.5">
                    {ndviResult.recommendations?.map((rec, i) => (
                      <li key={i} className="text-xs text-[var(--text-contrast)] flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-[11px] text-[var(--text-muted)] flex justify-between pt-2 border-t border-[var(--glass-border)]">
                  <span>Motor: {ndviResult.engine}</span>
                  <span>Reflectancia NIR: {ndviResult.bands?.NIR_reflectance} | RED: {ndviResult.bands?.RED_reflectance}</span>
                </div>
              </div>
            ) : (
              <div className="glass-card !p-12 text-center border-dashed border-[var(--glass-border)] space-y-3">
                <Satellite size={48} className="mx-auto text-emerald-400/40 animate-bounce" />
                <h4 className="text-sm font-bold text-[var(--text-contrast)]">Listo para escanear</h4>
                <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                  Haz clic en el botón de la izquierda para calcular el índice de vegetación multiespectral con el microservicio Python.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: FITOPATOLOGÍA & ENFERMEDADES ────────────────────────── */}
      {activeTab === 'diagnose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-card !p-6 space-y-4">
              <h3 className="text-base font-bold text-[var(--text-contrast)] flex items-center gap-2">
                <Microscope size={18} className="text-purple-400" />
                Diagnóstico de Sanidad Vegetal
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Identificación de hongos, plagas, bacterias y deficiencias nutricionales mediante el motor fitopatológico de IA.
              </p>

              <div className="space-y-3">
                <div className="input-group">
                  <label className="input-label">Cultivo</label>
                  <input
                    type="text"
                    className="input-field"
                    value={diagForm.crop}
                    onChange={e => setDiagForm({ ...diagForm, crop: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Descripción de síntomas observados en campo</label>
                  <textarea
                    rows={3}
                    className="input-field"
                    value={diagForm.symptoms}
                    onChange={e => setDiagForm({ ...diagForm, symptoms: e.target.value })}
                    placeholder="Describe coloración de hojas, presencia de perforaciones, manchas o marchitez..."
                  />
                </div>

                <button
                  onClick={handleDiagnosis}
                  disabled={loading}
                  className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Microscope size={16} />
                  <span>{loading ? 'Consultando modelo fitopatológico...' : 'Analizar y Diagnosticar'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {diagResult ? (
              <div className="glass-card !p-6 space-y-5 border-purple-500/30">
                <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">Patógeno Identificado</span>
                    <h3 className="text-lg font-extrabold text-[var(--text-contrast)]">{diagResult.diagnosticoPrincipal}</h3>
                    <span className="text-xs text-[var(--text-muted)]">Tipo: {diagResult.tipoPatogeno}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-center">
                    <span className="text-[10px] text-purple-300 font-bold block uppercase">Confianza IA</span>
                    <span className="text-2xl font-black text-purple-400">{diagResult.nivelConfianzaPct}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <h5 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                      🌱 Manejo Orgánico / Biocontrol:
                    </h5>
                    <p className="text-xs text-[var(--text-contrast)]">{diagResult.planDeAccion?.manejoOrganico}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <h5 className="text-xs font-bold text-blue-300 flex items-center gap-1.5 mb-1">
                      🧪 Control Químico Convencional:
                    </h5>
                    <p className="text-xs text-[var(--text-contrast)]">{diagResult.planDeAccion?.controlQuimico}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                      🛡️ Medidas Preventivas y Culturales:
                    </h5>
                    <p className="text-xs text-[var(--text-contrast)]">{diagResult.planDeAccion?.prevencion}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card !p-12 text-center border-dashed border-[var(--glass-border)] space-y-3">
                <Microscope size={48} className="mx-auto text-purple-400/40 animate-pulse" />
                <h4 className="text-sm font-bold text-[var(--text-contrast)]">Diagnóstico Asistido por IA</h4>
                <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                  Ingresa los síntomas observados para obtener un plan de control integrado (biológico, químico y preventivo).
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: SMART IRRIGATION ───────────────────────────────────── */}
      {activeTab === 'irrigation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-card !p-6 space-y-4">
              <h3 className="text-base font-bold text-[var(--text-contrast)] flex items-center gap-2">
                <Droplets size={18} className="text-blue-400" />
                Cálculo de Balance Hídrico
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Algoritmo de Penman-Monteith / Hargreaves para calcular Evapotranspiración (ET0) y prescripción milimétrica de agua.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="input-label">Temperatura (°C)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={irrigForm.tempC}
                    onChange={e => setIrrigForm({ ...irrigForm, tempC: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Humedad Relativa (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={irrigForm.humidityPct}
                    onChange={e => setIrrigForm({ ...irrigForm, humidityPct: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="input-label">Lluvia pronosticada (mm)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={irrigForm.rainForecastMm}
                    onChange={e => setIrrigForm({ ...irrigForm, rainForecastMm: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Área del Lote (Ha)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={irrigForm.areaHa}
                    onChange={e => setIrrigForm({ ...irrigForm, areaHa: e.target.value })}
                  />
                </div>
              </div>

              <button
                onClick={handleIrrigationCalculate}
                disabled={loading}
                className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Droplets size={16} />
                <span>{loading ? 'Calculando balance hídrico...' : 'Prescribir Riego Óptimo'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {irrigResult ? (
              <div className="glass-card !p-6 space-y-5 border-blue-500/30">
                <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Recomendación Hídrica</span>
                    <h3 className="text-lg font-extrabold text-[var(--text-contrast)]">{irrigResult.prescripcionRiego?.estado}</h3>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-center">
                    <span className="text-[10px] text-blue-300 font-bold block uppercase">Tiempo Riego</span>
                    <span className="text-2xl font-black text-blue-400">{irrigResult.prescripcionRiego?.tiempoEstimadoRiegoHoras} hrs</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase">Demanda (ETc)</span>
                    <strong className="text-sm text-[var(--text-contrast)]">{irrigResult.balanceHidrico?.demandaCultivoETc_mm_dia} mm/día</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase">Déficit Neto</span>
                    <strong className="text-sm text-blue-400">{irrigResult.balanceHidrico?.deficitHidrico_mm} mm</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase">Volumen Total</span>
                    <strong className="text-sm text-emerald-400">{irrigResult.prescripcionRiego?.volumenTotalLoteM3} m³</strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <h5 className="text-xs font-bold text-blue-300 mb-1">📅 Frecuencia y Plan de Turno:</h5>
                  <p className="text-xs text-[var(--text-contrast)]">{irrigResult.prescripcionRiego?.frecuenciaRecomendada}</p>
                </div>
              </div>
            ) : (
              <div className="glass-card !p-12 text-center border-dashed border-[var(--glass-border)] space-y-3">
                <Droplets size={48} className="mx-auto text-blue-400/40 animate-pulse" />
                <h4 className="text-sm font-bold text-[var(--text-contrast)]">Programador Hidroclimático</h4>
                <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                  Ajusta los factores climáticos para calcular los metros cúbicos exactos y evitar tanto el déficit como el encharcamiento.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: YIELD PREDICTION ───────────────────────────────────── */}
      {activeTab === 'yield' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-card !p-6 space-y-4">
              <h3 className="text-base font-bold text-[var(--text-contrast)] flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-400" />
                Predicción de Rendimiento & Cosecha
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Proyecciones de Toneladas / Hectárea basadas en fertilización, área e historial.
              </p>

              <div className="space-y-3">
                <div className="input-group">
                  <label className="input-label">Cultivo</label>
                  <input
                    type="text"
                    className="input-field"
                    value={yieldForm.crop}
                    onChange={e => setYieldForm({ ...yieldForm, crop: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Área a cosechar (Ha)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={yieldForm.areaHa}
                    onChange={e => setYieldForm({ ...yieldForm, areaHa: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Nivel de Fertilización N-P-K (Kg/Ha)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={yieldForm.fertilizerKgHa}
                    onChange={e => setYieldForm({ ...yieldForm, fertilizerKgHa: e.target.value })}
                  />
                </div>

                <button
                  onClick={handleYieldPredict}
                  disabled={loading}
                  className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <TrendingUp size={16} />
                  <span>{loading ? 'Calculando regresión predictiva...' : 'Proyectar Rendimiento'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {yieldResult ? (
              <div className="glass-card !p-6 space-y-5 border-amber-500/30">
                <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Rendimiento Proyectado</span>
                    <h3 className="text-2xl font-black text-amber-400">{yieldResult.rendimientoEstimadoTonHa} Ton/Ha</h3>
                    <span className="text-xs text-[var(--text-muted)]">{yieldResult.intervaloConfianza}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-center">
                    <span className="text-[10px] text-amber-300 font-bold block uppercase">Producción Total</span>
                    <span className="text-2xl font-black text-white">{yieldResult.cosechaTotalProyectadaTon} Ton</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-[var(--text-contrast)] uppercase tracking-wider">Factores Críticos para Alcanzar la Meta:</h5>
                  <ul className="space-y-2">
                    {yieldResult.factoresCriticos?.map((factor, i) => (
                      <li key={i} className="text-xs text-[var(--text-contrast)] p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="glass-card !p-12 text-center border-dashed border-[var(--glass-border)] space-y-3">
                <TrendingUp size={48} className="mx-auto text-amber-400/40 animate-pulse" />
                <h4 className="text-sm font-bold text-[var(--text-contrast)]">Modelado de Rendimiento</h4>
                <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                  Calcula el potencial productivo en toneladas de tu lote según insumos y dosis aplicadas.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
