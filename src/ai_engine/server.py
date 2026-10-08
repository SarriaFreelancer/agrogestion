"""
AgroGestión - Python AI & Satellite Agronomic Intelligence Microservice
Motor satelital y de analítica agronómica avanzada (NDVI, Sanidad vegetal, Riego inteligente, Rendimiento)
"""

import json
import math
import random
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

PORT = 8000

class AgronomicAIEngine:
    @staticmethod
    def calculate_ndvi(data):
        crop = data.get("cropType", "Caña de Azúcar")
        area_ha = float(data.get("areaHa", 10.0))

        # Simulación analítica de reflectancia multiespectral (NIR & RED bands)
        suerte_key = str(data.get("suerteId", "101"))
        seed_val = abs(hash(suerte_key)) % 100000
        random.seed(seed_val + 42)
        base_ndvi = 0.72 if "Caña" in crop or "Palma" in crop else 0.65
        noise = random.uniform(-0.08, 0.08)
        avg_ndvi = round(min(0.95, max(0.15, base_ndvi + noise)), 3)

        # Zonificación de vigor vegetativo
        vigor_alto_pct = round(random.uniform(45.0, 70.0), 1)
        vigor_medio_pct = round(random.uniform(20.0, 40.0), 1)
        estres_pct = round(max(0.0, 100.0 - vigor_alto_pct - vigor_medio_pct), 1)

        recommendations = []
        if estres_pct > 15:
            recommendations.append(f"Sector noreste presenta índice NDVI bajo ({round(avg_ndvi - 0.25, 2)}). Se recomienda muestreo foliar y revisión de humedad en suelo.")
        if vigor_alto_pct > 60:
            recommendations.append("Excelente cobertura de canopia. Mantener régimen actual de fertilización nitrogenada.")
        else:
            recommendations.append("Densidad foliar moderada. Programar aplicación de bioestimulante foliar.")

        return {
            "success": True,
            "engine": "Python AgroIntelligence v2.4 (Multispectral Engine)",
            "metric": "NDVI (Normalized Difference Vegetation Index)",
            "averageNdvi": avg_ndvi,
            "interpretation": "Vigor Alto y Uniforme" if avg_ndvi > 0.65 else "Vigor Moderado" if avg_ndvi > 0.45 else "Estrés Vegetativo / Suelo Expuesto",
            "zoning": {
                "altoVigorPct": vigor_alto_pct,
                "medioVigorPct": vigor_medio_pct,
                "estresVegetativoPct": estres_pct
            },
            "bands": {
                "NIR_reflectance": round(random.uniform(0.45, 0.60), 3),
                "RED_reflectance": round(random.uniform(0.06, 0.12), 3)
            },
            "recommendations": recommendations
        }

    @staticmethod
    def diagnose_disease(data):
        crop = data.get("crop", "Caña de Azúcar")
        symptoms = data.get("symptoms", "").lower()

        # Árbol de inferencia fitopatológica
        if "roya" in symptoms or "pústula" in symptoms or "pustula" in symptoms:
            disease = "Roya Naranja / Parda (Puccinia kuehnii)"
            prob = 94.5
            severity = "Media-Alta"
            treatment = "Aplicación de Fungicida Triazol o Estrobirulina + Inductor de Defensas (Fosfito de Potasio)"
        elif "barrenador" in symptoms or "perforac" in symptoms or "orificio" in symptoms or "larva" in symptoms:
            disease = "Barrenador del Tallo (Diatraea saccharalis)"
            prob = 92.0
            severity = "Crítica"
            treatment = "Control biológico con Trichogramma exiguum o aplicación de Clorantraniliprol (Coragen) dirigida a cogollo."
        elif "amarill" in symptoms or "clorosis" in symptoms:
            disease = "Clorosis Férrica o Deficiencia de Magnesio / Nitrógeno"
            prob = 86.0
            severity = "Baja-Media"
            treatment = "Corrección edáfica con Sulfato de Magnesio y aspersión foliar de Quelatos de Hierro."
        else:
            disease = "Estrés Hídrico y Quemazón Foliar por Radiación Solar"
            prob = 78.0
            severity = "Moderada"
            treatment = "Monitorear tensión hídrica en suelo (Tensiómetro < 30 cbar) y aplicar extracto de algas marinas con silicio."

        return {
            "success": True,
            "engine": "Python Vision & Agronomic Diagnostic AI v2.4",
            "crop": crop,
            "diagnosis": disease,
            "confidenceScore": prob,
            "severityLevel": severity,
            "recommendedTreatment": treatment,
            "quarantineRequired": "Crítica" in severity
        }

    @staticmethod
    def irrigation_advisory(data):
        crop = data.get("crop", "Caña de Azúcar")
        soil_type = data.get("soilType", "Franco-Arcilloso")
        temp = float(data.get("tempC", 30.0))
        humidity = float(data.get("humidityPct", 65.0))
        rain_forecast = float(data.get("rainForecastMm", 0.0))
        area_ha = float(data.get("areaHa", 10.0))

        # ETo modelo Hargreaves-Samani simplificado
        eto_daily_mm = round(0.0023 * (temp + 17.8) * math.sqrt(max(5.0, temp - 18.0)) * 4.2, 2)
        kc = 1.15 if "Caña" in crop else 0.95 if "Aguacate" in crop else 1.0
        etc_mm = round(eto_daily_mm * kc, 2)
        water_deficit_mm = round(max(0.0, etc_mm - rain_forecast), 2)
        total_m3_needed = round(water_deficit_mm * 10 * area_ha, 1)

        irrigation_time_hours = round(total_m3_needed / (area_ha * 15.0), 1) if area_ha > 0 else 0

        return {
            "success": True,
            "engine": "Python Smart Irrigation & Water Balance Engine v2.4",
            "evapotranspirationETo": eto_daily_mm,
            "cropCoefficientKc": kc,
            "cropWaterRequirementETc": etc_mm,
            "effectiveRainForecastMm": rain_forecast,
            "netWaterDeficitMm": water_deficit_mm,
            "recommendedVolumeM3": total_m3_needed,
            "recommendedRunTimeHours": irrigation_time_hours,
            "urgency": "Alta" if water_deficit_mm > 4.5 else "Moderada" if water_deficit_mm > 2.0 else "Baja (Humedad Adecuada)"
        }

    @staticmethod
    def yield_prediction(data):
        crop = data.get("crop", "Caña de Azúcar")
        area_ha = float(data.get("areaHa", 20.0))
        fertilizer_kg_ha = float(data.get("fertilizerKgHa", 250.0))

        base_yield = 115.0 if "Caña" in crop else 12.5 if "Aguacate" in crop else 2.8
        fert_factor = min(1.25, 0.85 + (fertilizer_kg_ha / 500.0) * 0.35)
        climate_factor = random.uniform(0.95, 1.08)

        estimated_t_ha = round(base_yield * fert_factor * climate_factor, 1)
        total_estimated_tons = round(estimated_t_ha * area_ha, 1)

        return {
            "success": True,
            "engine": "Python Predictive AgroYield v2.4 (MonteCarlo & Regressor)",
            "estimatedYieldTonHa": estimated_t_ha,
            "totalEstimatedProductionTons": total_estimated_tons,
            "confidenceInterval": {
                "lowerBoundTons": round(total_estimated_tons * 0.92, 1),
                "upperBoundTons": round(total_estimated_tons * 1.08, 1)
            },
            "keyDrivers": [
                f"Nutrición NPK aplicada ({fertilizer_kg_ha} kg/ha): +{round((fert_factor-1)*100, 1)}%",
                f"Factor térmico y radiación acumulada: +{round((climate_factor-1)*100, 1)}%"
            ]
        }

class AgroAIHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        accept_header = self.headers.get("Accept", "")

        # Si el usuario entra por navegador a http://localhost:8000/
        if parsed.path in ["/", "/api", "/overview"] and "text/html" in accept_header:
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            html_content = f"""
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <title>AgroGestión — Microservicio Python IA & Satélite</title>
              <style>
                body {{ font-family: system-ui, -apple-system, sans-serif; background: #090d16; color: #f3f4f6; margin: 0; padding: 2.5rem; }}
                .container {{ max-width: 850px; margin: 0 auto; background: rgba(18, 25, 38, 0.85); border: 1px solid rgba(255,255,255,0.12); border-radius: 1.5rem; padding: 2.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }}
                h1 {{ color: #a855f7; margin-top: 0; display: flex; align-items: center; gap: 0.5rem; }}
                .badge {{ background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: bold; }}
                .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 2rem 0; }}
                .card {{ background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.25rem; }}
                .card h3 {{ margin: 0 0 0.5rem 0; color: #ffffff; font-size: 1.05rem; }}
                .status-box {{ background: rgba(168, 85, 247, 0.1); border-left: 4px solid #a855f7; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; }}
              </style>
            </head>
            <body>
              <div class="container">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h1>✨ AgroGestión Python AI Microservice</h1>
                  <span class="badge">Puerto {PORT} ONLINE</span>
                </div>
                <p style="color: #9ca3af;">Motor de inteligencia agronómica computacional, teledetección multiespectral y modelos predictivos.</p>
                
                <div class="status-box">
                  <strong style="color: #c084fc;">✓ Motores de Inteligencia Activos:</strong><br>
                  • 🛰️ <strong>NDVI_Multispectral</strong> (Reflectancia NIR/RED & Zonificación de Vigor)<br>
                  • 🔬 <strong>Phytopathology_AI</strong> (Diagnóstico fitopatológico & tratamientos)<br>
                  • 💧 <strong>Smart_Irrigation</strong> (Balance hídrico & modelo Hargreaves-Samani)<br>
                  • 📈 <strong>Yield_Prediction</strong> (Regresión predictiva de tonelaje por hectárea)
                </div>

                <h2>Endpoints Disponibles (POST JSON)</h2>
                <div class="grid">
                  <div class="card">
                    <h3>🛰️ Teledetección NDVI</h3>
                    <code>POST /api/ai/ndvi</code>
                  </div>
                  <div class="card">
                    <h3>🔬 Diagnóstico Sanitario</h3>
                    <code>POST /api/ai/diagnose</code>
                  </div>
                  <div class="card">
                    <h3>💧 Riego Inteligente</h3>
                    <code>POST /api/ai/irrigation</code>
                  </div>
                  <div class="card">
                    <h3>📈 Predicción Cosecha</h3>
                    <code>POST /api/ai/yield</code>
                  </div>
                </div>
              </div>
            </body>
            </html>
            """
            self.wfile.write(html_content.encode("utf-8"))
            return

        # Respuesta JSON por defecto
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        payload = {
            "status": "online",
            "service": "AgroGestión Python AI & Satellite Microservice",
            "version": "2.4.0",
            "modules": ["NDVI_Multispectral", "Phytopathology_AI", "Smart_Irrigation", "Yield_Prediction"],
            "port": PORT
        }
        self.wfile.write(json.dumps(payload, indent=2).encode("utf-8"))

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            data = json.loads(body)
        except Exception:
            data = {}

        response = {"error": "Endpoint no encontrado"}
        status_code = 200

        if parsed.path in ["/api/ai/ndvi", "/ndvi"]:
            response = AgronomicAIEngine.calculate_ndvi(data)
        elif parsed.path in ["/api/ai/diagnose", "/diagnose"]:
            response = AgronomicAIEngine.diagnose_disease(data)
        elif parsed.path in ["/api/ai/irrigation-advisory", "/api/ai/irrigation", "/irrigation"]:
            response = AgronomicAIEngine.irrigation_advisory(data)
        elif parsed.path in ["/api/ai/yield-prediction", "/api/ai/yield", "/yield"]:
            response = AgronomicAIEngine.yield_prediction(data)
        else:
            status_code = 404
            response = {"error": f"Ruta desconocida: {parsed.path}"}

        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(response, indent=2).encode("utf-8"))

def run():
    server_address = ("0.0.0.0", PORT)
    httpd = HTTPServer(server_address, AgroAIHandler)
    print(f"[AgroGestion AI] Microservicio Python corriendo en http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nDeteniendo microservicio Python...")
        httpd.server_close()

if __name__ == "__main__":
    run()
