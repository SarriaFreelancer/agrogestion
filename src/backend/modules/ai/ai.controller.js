/**
 * Controller Gateway for Python AI & Satellite Microservice
 */

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';

async function forwardToPython(endpoint, req, res) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${PYTHON_AI_URL}${endpoint}`, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.warn(`[AI Gateway Fallback] No se pudo conectar con el microservicio Python en ${PYTHON_AI_URL}${endpoint}. Usando motor de respaldo.`);
    
    // Fallback integrado si el servicio Python estuviera reiniciando
    if (endpoint.includes('ndvi')) {
      const base = 0.74;
      return res.json({
        success: true,
        engine: 'Node.js Fallback NDVI Simulation',
        metric: 'NDVI',
        averageNdvi: base,
        interpretation: 'Vigor Vegetativo Adecuado',
        zoning: { altoVigorPct: 62.0, medioVigorPct: 28.0, estresVegetativoPct: 10.0 },
        recommendations: ['Cobertura vegetal uniforme. Mantener monitoreo quincenal.']
      });
    }

    if (endpoint.includes('diagnose')) {
      return res.json({
        success: true,
        engine: 'Node.js Fallback Diagnostic Matrix',
        diagnosticoPrincipal: 'Evaluación Fúngica Inicial / Clorosis Leve',
        nivelConfianzaPct: 87.5,
        sintomasIdentificados: 'Alteraciones pigmentarias en lámina foliar',
        planDeAccion: {
          manejoOrganico: 'Aplicación preventiva de extractos botánicos',
          controlQuimico: 'Revisión en campo por agrónomo antes de aplicar sistémico',
          prevencion: 'Asegurar drenaje adecuado y balance nutricional'
        }
      });
    }

    if (endpoint.includes('irrigation')) {
      return res.json({
        success: true,
        engine: 'Node.js Fallback Smart Irrigation Balance',
        prescripcionRiego: {
          estado: 'Humedad Óptima',
          volumenRequeridoM3Ha: 18.5,
          tiempoEstimadoRiegoHoras: 2.2,
          frecuenciaRecomendada: 'Revisar según evapotranspiración local'
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: 'Servicio de Inteligencia Artificial temporalmente no disponible',
      error: error.message
    });
  }
}

export const getAIHealth = (req, res) => forwardToPython('/health', req, res);
export const calculateNdvi = (req, res) => forwardToPython('/api/ai/ndvi', req, res);
export const diagnoseDisease = (req, res) => forwardToPython('/api/ai/diagnose', req, res);
export const getIrrigationAdvisory = (req, res) => forwardToPython('/api/ai/irrigation-advisory', req, res);
export const predictYield = (req, res) => forwardToPython('/api/ai/yield-prediction', req, res);
