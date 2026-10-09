import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Leaf, Lock, Mail, ShieldCheck, Sun, Moon, Clock, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

export default function Auth({ loginUser }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoutReason, setLogoutReason] = useState('');
  const { modoOscuroGlobal, toggleThemeMode } = useTheme();

  useEffect(() => {
    try {
      const reason = localStorage.getItem('agro_logout_reason');
      if (reason) {
        setLogoutReason(reason);
      }
    } catch {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await loginUser({ email: formData.email, password: formData.password });
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <section className="auth-shell fade-in">
        <aside className="auth-brand-panel">
          <div className="auth-brand-mark">
            <Leaf size={28} strokeWidth={2.4} />
          </div>

          <div className="auth-brand-copy">
            <span className="auth-eyebrow">Plataforma agrícola integral</span>
            <h1>AgroGestión</h1>
            <p>
              Controla operación, campo, inventarios, usuarios y reportes desde un entorno
              claro, seguro y preparado para equipos en crecimiento.
            </p>
          </div>

          <div className="auth-benefits" aria-label="Beneficios de AgroGestión">
            <div>
              <CheckCircle2 size={18} />
              <span>Multi-cliente con base de datos propia</span>
            </div>
            <div>
              <CheckCircle2 size={18} />
              <span>Roles, módulos y permisos granulares</span>
            </div>
            <div>
              <CheckCircle2 size={18} />
              <span>Acceso automático según tu perfil</span>
            </div>
          </div>

          <div className="auth-status-card">
            <ShieldCheck size={22} />
            <div>
              <strong>Acceso seguro</strong>
              <span>Sesión protegida para usuarios autorizados</span>
            </div>
          </div>
        </aside>

        <div className="auth-card relative">
          
          {/* Quick Light/Dark Switcher at start of the system */}
          <div className="absolute top-5 right-5 z-20">
            <button
              type="button"
              onClick={toggleThemeMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--glass-bg)] hover:bg-white/[0.12] border border-[var(--glass-border)] text-xs font-bold text-[var(--text-contrast)] shadow-sm transition-all"
              title="Cambiar entre modo claro y oscuro"
            >
              {modoOscuroGlobal ? (
                <>
                  <Sun size={14} className="text-amber-400" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-indigo-400" />
                  <span>Modo Oscuro</span>
                </>
              )}
            </button>
          </div>

          <div className="auth-card-header pt-2">
            <span className="auth-card-kicker">Bienvenido de nuevo</span>
            <h2>Ingresa a tu cuenta</h2>
            <p>El sistema detectará tu cliente y acceso automáticamente.</p>

            {logoutReason === 'INACTIVITY' && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3 text-left animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <strong className="font-bold text-amber-200 block text-sm">Sesión finalizada por inactividad</strong>
                  <span>Tu sesión fue cerrada automáticamente para proteger la seguridad de tus datos agrícolas tras un tiempo sin interacción. Ingresa tus credenciales para reanudar.</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="input-label" htmlFor="auth-email">Correo electrónico</label>
              <div className="auth-input-wrap">
                <Mail size={19} className="auth-input-icon-left" />
                <input
                  id="auth-email"
                  type="email"
                  className="input-field"
                  placeholder="tu@correo.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="input-label" htmlFor="auth-password">Contraseña</label>
              <div className="auth-input-wrap">
                <Lock size={19} className="auth-input-icon-left" />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  className="input-field has-toggle"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-form-options">
              <label className="custom-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Recordarme</span>
              </label>
              <button type="button" className="auth-link">¿Olvidaste tu contraseña?</button>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              <span>{loading ? 'Verificando...' : 'Ingresar al sistema'}</span>
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="auth-copyright">
            © {new Date().getFullYear()} SarriaTech Solutions S.A.S.
          </div>
        </div>
      </section>
    </main>
  );
}
