import { useState } from 'react';
import { ArrowRight, CheckCircle2, Leaf, Lock, Mail, ShieldCheck } from 'lucide-react';

export default function Auth({ loginUser }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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

        <div className="auth-card">
          <div className="auth-card-header">
            <span className="auth-card-kicker">Bienvenido de nuevo</span>
            <h2>Ingresa a tu cuenta</h2>
            <p>El sistema detectará tu cliente y acceso automáticamente.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="input-label" htmlFor="auth-email">Correo electrónico</label>
              <div className="auth-input-wrap">
                <Mail size={19} />
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
                <Lock size={19} />
                <input
                  id="auth-password"
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                />
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
