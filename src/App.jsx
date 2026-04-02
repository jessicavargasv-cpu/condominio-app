import { useState, useEffect } from "react";

// ── CONFIGURACIÓN SUPABASE ────────────────────────────────────────
const SUPABASE_URL = "https://gztkowyoztqupeplhvev.supabase.co";
const SUPABASE_KEY = "sb_publishable_3mzA7ePIapL8XEhlno1bZQ_jU0sF9h2";

// ── API Supabase ──────────────────────────────────────────────────
const query = async (table, options = {}) => {
  const { filter, insert, update, remove, select = "*" } = options;
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };
  if (filter) url += `&${filter}`;
  if (insert) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: "POST", headers, body: JSON.stringify(insert) });
    return res.json();
  }
  if (update) {
    const { where, data } = update;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${where}`, { method: "PATCH", headers, body: JSON.stringify(data) });
    return res.json();
  }
  if (remove) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?${remove}`, { method: "DELETE", headers });
    return;
  }
  const res = await fetch(url, { headers });
  return res.json();
};

// ── Auth Supabase ─────────────────────────────────────────────────
const authLogin = async (email, password) => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
};

const authLogout = async (token) => {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` }
  });
};

// ── Categorías base ───────────────────────────────────────────────
const TODAS_CATEGORIAS = [
  { id: "caldera", label: "Caldera", emoji: "🔥" },
  { id: "jardin", label: "Jardín", emoji: "🌿" },
  { id: "limpia_vidrios", label: "Limpia vidrios", emoji: "🪟" },
  { id: "costura", label: "Costura", emoji: "🧵" },
  { id: "gasfiter", label: "Gasfíter", emoji: "🔧" },
  { id: "electricista", label: "Electricista", emoji: "⚡" },
  { id: "otro", label: "Otro", emoji: "📋" },
];

const PALETAS = [
  { nombre: "Bosque",    accent: "#2D6A4F", accentLight: "#D8EFE4", bg: "#F5F2EC", surface: "#FDFBF7", border: "#E2DDD4" },
  { nombre: "Océano",    accent: "#1A4A7A", accentLight: "#D6E8F7", bg: "#F0F4F8", surface: "#FAFCFF", border: "#D0DCE8" },
  { nombre: "Terracota", accent: "#9B3922", accentLight: "#F7E0DA", bg: "#FAF5F2", surface: "#FFFCFB", border: "#EADDD8" },
  { nombre: "Pizarra",   accent: "#3D4F6B", accentLight: "#D9DEE8", bg: "#F2F3F5", surface: "#FAFAFA", border: "#DDE0E6" },
  { nombre: "Lavanda",   accent: "#5B4B8A", accentLight: "#EAE5F5", bg: "#F5F3FA", surface: "#FDFCFF", border: "#E0DBF0" },
  { nombre: "Dorado",    accent: "#8B6914", accentLight: "#F5EDD0", bg: "#FAF8F0", surface: "#FFFDF5", border: "#EDE5CC" },
];

const EMOJIS_SUGERIDOS = ["🏠","🚗","🐾","🧹","🪛","🎨","🔑","📦","🛁","🪴","🏊","🧺","🖥️","📡","🔒","🚿","🧯","🪞","🛗","🏋️"];

// ── Estilos globales ──────────────────────────────────────────────
const buildCSS = (c) => `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${c.bg};
    --surface: ${c.surface};
    --border: ${c.border};
    --text: #1C1A16;
    --text-muted: #8A8070;
    --accent: ${c.accent};
    --accent-light: ${c.accentLight};
    --warn: #C0392B;
    --warn-light: #FDECEA;
    --gold: #B5860D;
    --gold-light: #FDF3DC;
    --radius: 14px;
    --shadow: 0 2px 16px rgba(28,26,22,0.08);
  }
  body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); }
  .serif { font-family: 'DM Serif Display', serif; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px);} to { opacity:1; transform:translateY(0);} }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.8s linear infinite; display: inline-block; }
`;

const defaultCSS = buildCSS({ accent: "#2D6A4F", accentLight: "#D8EFE4", bg: "#F5F2EC", surface: "#FDFBF7", border: "#E2DDD4" });

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)",
  borderRadius: 10, fontSize: 14, background: "var(--surface)",
  color: "var(--text)", outline: "none", fontFamily: "inherit",
};
const labelStyle = {
  fontSize: 12, fontWeight: 600, color: "var(--text-muted)",
  letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, display: "block"
};

// ── Spinner ───────────────────────────────────────────────────────
const Cargando = ({ mensaje = "Cargando..." }) => (
  <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "var(--text-muted)" }}>
    <span className="spin" style={{ fontSize: 28 }}>⟳</span>
    <p style={{ fontSize: 14 }}>{mensaje}</p>
  </div>
);

// ── Badge categoría ───────────────────────────────────────────────
const Badge = ({ categoriaId, todasCats }) => {
  const cat = todasCats.find(c => c.id === categoriaId);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: "var(--accent-light)", color: "var(--accent)",
      fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
      padding: "3px 10px", borderRadius: 999, textTransform: "uppercase"
    }}>
      {cat?.emoji} {cat?.label}
    </span>
  );
};

// ── Tarjeta proveedor ─────────────────────────────────────────────
const ProveedorCard = ({ p, todasCats }) => (
  <div className="fade-up" style={{
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", padding: "20px 22px",
    boxShadow: "var(--shadow)", display: "flex", flexDirection: "column", gap: 10,
    transition: "transform 0.2s, box-shadow 0.2s",
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(28,26,22,0.12)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: 16 }}>{p.nombre}</p>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>📞 {p.telefono}</p>
      </div>
      <Badge categoriaId={p.categoria} todasCats={todasCats} />
    </div>
    {p.descripcion && <p style={{ fontSize: 14, color: "#4A4540", lineHeight: 1.6 }}>{p.descripcion}</p>}
    <span style={{
      alignSelf: "flex-start", fontSize: 12, fontWeight: 600,
      color: p.recomienda ? "var(--accent)" : "var(--warn)",
      background: p.recomienda ? "var(--accent-light)" : "var(--warn-light)",
      padding: "3px 10px", borderRadius: 999
    }}>
      {p.recomienda ? "👍 Recomendado" : "👎 No recomendado"}
    </span>
  </div>
);

// ── Vista Pública ─────────────────────────────────────────────────
const VistaPublica = ({ condominio, todasCats, onProponer }) => {
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const data = await query("proveedores", {
        filter: `condominio=eq.${condominio.slug}&estado=eq.aprobado&order=id.desc`
      });
      setProveedores(Array.isArray(data) ? data : []);
      setCargando(false);
    };
    cargar();
  }, [condominio.slug]);

  const cats = todasCats.filter(c => condominio.categorias_activas.includes(c.id));
  const filtrados = proveedores.filter(p => {
    const matchCat = filtro === "todos" || p.categoria === filtro;
    const matchBusq = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusq;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "28px 24px 20px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 4 }}>Directorio de Servicios</p>
              <h1 className="serif" style={{ fontSize: 30, lineHeight: 1.15 }}>{condominio.nombre}</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 5 }}>Servicios verificados por tus vecinos</p>
            </div>
            <button onClick={onProponer} style={{
              background: "var(--accent)", color: "#fff", border: "none",
              borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >+ Proponer proveedor</button>
          </div>
          <input placeholder="Buscar por nombre o descripción..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{ ...inputStyle, marginTop: 18, background: "var(--bg)" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {[{ id: "todos", label: "Todos", emoji: "🏠" }, ...cats].map(cat => (
              <button key={cat.id} onClick={() => setFiltro(cat.id)} style={{
                background: filtro === cat.id ? "var(--accent)" : "var(--surface)",
                color: filtro === cat.id ? "#fff" : "var(--text-muted)",
                border: `1.5px solid ${filtro === cat.id ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit"
              }}>{cat.emoji} {cat.label}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px 48px" }}>
        {cargando ? <Cargando mensaje="Cargando proveedores..." /> : filtrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            <p style={{ fontSize: 40 }}>🔍</p>
            <p style={{ marginTop: 12, fontSize: 15 }}>No hay proveedores en esta categoría aún.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filtrados.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${i * 0.06}s` }}>
                <ProveedorCard p={p} todasCats={todasCats} />
              </div>
            ))}
          </div>
        )}
        {!cargando && <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, marginTop: 32 }}>
          {filtrados.length} proveedor{filtrados.length !== 1 ? "es" : ""} verificado{filtrados.length !== 1 ? "s" : ""}
        </p>}
      </div>
    </div>
  );
};

// ── Formulario Propuesta ──────────────────────────────────────────
const FormularioPropuesta = ({ condominio, todasCats, onVolver }) => {
  const [form, setForm] = useState({ nombre: "", categoria: "", telefono: "", descripcion: "", recomienda: true });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cats = todasCats.filter(c => condominio.categorias_activas.includes(c.id));
  const valido = form.nombre && form.categoria && form.telefono;

  const handleEnviar = async () => {
    if (!valido) return;
    setEnviando(true);
    await query("proveedores", {
      insert: {
        condominio: condominio.slug,
        nombre: form.nombre, categoria: form.categoria,
        telefono: form.telefono, descripcion: form.descripcion,
        recomienda: form.recomienda, estado: "pendiente"
      }
    });
    setEnviando(false);
    setEnviado(true);
  };

  if (enviado) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 380 }} className="fade-up">
        <div style={{ fontSize: 56 }}>✅</div>
        <h2 className="serif" style={{ fontSize: 28, marginTop: 16 }}>¡Propuesta enviada!</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 10, lineHeight: 1.6 }}>
          Un administrador de <strong>{condominio.nombre}</strong> revisará la información antes de publicarla.
        </p>
        <button onClick={onVolver} style={{
          marginTop: 24, background: "var(--accent)", color: "#fff",
          border: "none", borderRadius: 10, padding: "12px 28px",
          fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
        }}>Volver al directorio</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px 24px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }} className="fade-up">
        <button onClick={onVolver} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: "0 0 20px", fontFamily: "inherit" }}>← Volver</button>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", boxShadow: "var(--shadow)" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 4 }}>{condominio.nombre}</p>
          <h2 className="serif" style={{ fontSize: 26, marginBottom: 4 }}>Proponer proveedor</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>La información será revisada antes de publicarse.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Nombre o empresa *</label>
              <input style={inputStyle} value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Ej: Carlos Muñoz / Limpieza Total SpA" />
            </div>
            <div>
              <label style={labelStyle}>Categoría *</label>
              <select style={{ ...inputStyle, appearance: "none" }} value={form.categoria} onChange={e => set("categoria", e.target.value)}>
                <option value="">Seleccionar...</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Teléfono / WhatsApp *</label>
              <input style={inputStyle} value={form.telefono} onChange={e => set("telefono", e.target.value)} placeholder="+56 9 XXXX XXXX" />
            </div>
            <div>
              <label style={labelStyle}>Descripción breve</label>
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                value={form.descripcion} onChange={e => set("descripcion", e.target.value)}
                placeholder="¿Qué hace? ¿Algo que destacar?" />
            </div>
            <div>
              <label style={labelStyle}>¿Lo recomiendas?</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[true, false].map(v => (
                  <button key={String(v)} onClick={() => set("recomienda", v)} style={{
                    flex: 1, padding: 10,
                    border: `2px solid ${form.recomienda === v ? (v ? "var(--accent)" : "var(--warn)") : "var(--border)"}`,
                    background: form.recomienda === v ? (v ? "var(--accent-light)" : "var(--warn-light)") : "var(--surface)",
                    borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14,
                    color: form.recomienda === v ? (v ? "var(--accent)" : "var(--warn)") : "var(--text-muted)"
                  }}>{v ? "👍 Sí" : "👎 No"}</button>
                ))}
              </div>
            </div>
            <button onClick={handleEnviar} disabled={!valido || enviando} style={{
              marginTop: 4, background: (!valido || enviando) ? "var(--border)" : "var(--accent)",
              color: (!valido || enviando) ? "var(--text-muted)" : "#fff",
              border: "none", borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 600,
              cursor: (!valido || enviando) ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.2s"
            }}>{enviando ? "⟳ Enviando..." : "Enviar propuesta"}</button>
            <p style={{
              fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6,
              borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4
            }}>
              🔒 Los datos ingresados serán publicados en el directorio del condominio una vez validados. Si eres el proveedor y deseas eliminar tu información, contacta al administrador en <strong>admin.appx@gmail.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Login Admin ───────────────────────────────────────────────────
const LoginAdmin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Completa todos los campos."); return; }
    setCargando(true);
    setError("");
    const data = await authLogin(email, password);
    if (data.access_token) {
      onLogin(data.access_token);
    } else {
      setError("Email o contraseña incorrectos.");
    }
    setCargando(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }} className="fade-up">
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "36px 32px", boxShadow: "var(--shadow)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🔐</p>
            <h2 className="serif" style={{ fontSize: 26 }}>Panel Administrador</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>Acceso restringido</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@ejemplo.com"
                onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <div>
              <label style={labelStyle}>Contraseña</label>
              <input style={inputStyle} type="password" value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            {error && <p style={{ fontSize: 13, color: "var(--warn)", background: "var(--warn-light)", padding: "8px 12px", borderRadius: 8 }}>⚠ {error}</p>}
            <button onClick={handleLogin} disabled={cargando} style={{
              marginTop: 4, background: cargando ? "var(--border)" : "var(--accent)",
              color: cargando ? "var(--text-muted)" : "#fff",
              border: "none", borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 600,
              cursor: cargando ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.2s"
            }}>{cargando ? "⟳ Verificando..." : "Ingresar"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Panel Admin ───────────────────────────────────────────────────
const PanelAdmin = ({ condominios, todasCats, setTodasCats, onActualizarCondominio, adminToken, onLogout }) => {
  const [condominioActivo, setCondominioActivo] = useState(condominios[0]?.slug || "");
  const [tab, setTab] = useState("proveedores");
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [guardado, setGuardado] = useState(false);
  const [nuevaCat, setNuevaCat] = useState({ label: "", emoji: "🏠" });
  const [catError, setCatError] = useState("");
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  const [editandoProveedor, setEditandoProveedor] = useState(null);

  const cond = condominios.find(c => c.slug === condominioActivo);

  useEffect(() => {
    if (cond) setEditando({ ...cond, colores: { ...cond.colores } });
  }, [condominioActivo, condominios]);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const data = await query("proveedores", { filter: `condominio=eq.${condominioActivo}&order=id.desc` });
      setProveedores(Array.isArray(data) ? data : []);
      setCargando(false);
    };
    if (condominioActivo) cargar();
  }, [condominioActivo]);

  const handleAprobar = async (id) => {
    await query("proveedores", { update: { where: `id=eq.${id}`, data: { estado: "aprobado" } } });
    setProveedores(p => p.map(x => x.id === id ? { ...x, estado: "aprobado" } : x));
  };

  const handleRechazar = async (id) => {
    await query("proveedores", { remove: `id=eq.${id}` });
    setProveedores(p => p.filter(x => x.id !== id));
  };

  const handleEditar = async (id, datos) => {
    await query("proveedores", { update: { where: `id=eq.${id}`, data: datos } });
    setProveedores(p => p.map(x => x.id === id ? { ...x, ...datos } : x));
    setEditandoProveedor(null);
  };

  const handleGuardarCondominio = async () => {
    await query("condominios", {
      update: {
        where: `slug=eq.${condominioActivo}`,
        data: { nombre: editando.nombre, colores: editando.colores, categorias_activas: editando.categorias_activas }
      }
    });
    onActualizarCondominio(editando);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const handleAgregarCategoria = async () => {
    const label = nuevaCat.label.trim();
    if (!label) { setCatError("Escribe un nombre."); return; }
    const id = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (todasCats.find(c => c.id === id)) { setCatError("Ya existe esa categoría."); return; }
    await query("categorias_custom", { insert: { id, label, emoji: nuevaCat.emoji } });
    const nueva = { id, label, emoji: nuevaCat.emoji, custom: true };
    const nuevasCats = [...todasCats, nueva];
    const nuevasActivas = [...editando.categorias_activas, id];
    setTodasCats(nuevasCats);
    const nuevoEditando = { ...editando, categorias_activas: nuevasActivas };
    setEditando(nuevoEditando);
    await query("condominios", { update: { where: `slug=eq.${condominioActivo}`, data: { categorias_activas: nuevasActivas } } });
    onActualizarCondominio(nuevoEditando);
    setNuevaCat({ label: "", emoji: "🏠" });
    setCatError("");
    setMostrarEmojis(false);
  };

  const handleEliminarCategoria = async (id) => {
    await query("categorias_custom", { remove: `id=eq.${id}` });
    setTodasCats(prev => prev.filter(c => c.id !== id));
    setEditando(prev => ({ ...prev, categorias_activas: prev.categorias_activas.filter(c => c !== id) }));
  };

  if (!editando) return <Cargando />;

  const pendientes = proveedores.filter(p => p.estado === "pendiente");
  const aprobados = proveedores.filter(p => p.estado === "aprobado");

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      background: tab === id ? "var(--accent)" : "transparent",
      color: tab === id ? "#fff" : "var(--text-muted)",
      border: "none", borderRadius: 8, padding: "8px 18px",
      fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s"
    }}>{label}</button>
  );

  const FilaProveedor = ({ p, esPendiente }) => (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: "16px 20px",
      display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap"
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontWeight: 600 }}>{p.nombre}</span>
          <Badge categoriaId={p.categoria} todasCats={todasCats} />
          <span style={{ fontSize: 12, color: p.recomienda ? "var(--accent)" : "var(--warn)", fontWeight: 600 }}>{p.recomienda ? "👍" : "👎"}</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>📞 {p.telefono}</p>
        {p.descripcion && <p style={{ fontSize: 13, marginTop: 4 }}>{p.descripcion}</p>}
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {esPendiente && (
          <button onClick={() => handleAprobar(p.id)} style={{
            background: "var(--accent-light)", color: "var(--accent)", border: "none",
            borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
          }}>✓ Aprobar</button>
        )}
        <button onClick={() => setEditandoProveedor({ ...p })} style={{
          background: "var(--gold-light)", color: "var(--gold)", border: "none",
          borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
        }}>✏️ Editar</button>
        <button onClick={() => handleRechazar(p.id)} style={{
          background: "var(--warn-light)", color: "var(--warn)", border: "none",
          borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
        }}>{esPendiente ? "✕ Rechazar" : "🗑 Eliminar"}</button>
      </div>
    </div>
  );

  const ModalEditarProveedor = () => {
    const [form, setForm] = useState({ ...editandoProveedor });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const cats = todasCats.filter(c => cond.categorias_activas.includes(c.id));
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}
        onClick={e => e.target === e.currentTarget && setEditandoProveedor(null)}>
        <div className="fade-up" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(28,26,22,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 className="serif" style={{ fontSize: 22 }}>Editar proveedor</h3>
            <button onClick={() => setEditandoProveedor(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label style={labelStyle}>Nombre o empresa</label><input style={inputStyle} value={form.nombre} onChange={e => set("nombre", e.target.value)} /></div>
            <div>
              <label style={labelStyle}>Categoría</label>
              <select style={{ ...inputStyle, appearance: "none" }} value={form.categoria} onChange={e => set("categoria", e.target.value)}>
                {cats.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Teléfono / WhatsApp</label><input style={inputStyle} value={form.telefono} onChange={e => set("telefono", e.target.value)} /></div>
            <div><label style={labelStyle}>Descripción</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} value={form.descripcion || ""} onChange={e => set("descripcion", e.target.value)} /></div>
            <div>
              <label style={labelStyle}>¿Lo recomiendas?</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[true, false].map(v => (
                  <button key={String(v)} onClick={() => set("recomienda", v)} style={{
                    flex: 1, padding: 10,
                    border: `2px solid ${form.recomienda === v ? (v ? "var(--accent)" : "var(--warn)") : "var(--border)"}`,
                    background: form.recomienda === v ? (v ? "var(--accent-light)" : "var(--warn-light)") : "var(--surface)",
                    borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14,
                    color: form.recomienda === v ? (v ? "var(--accent)" : "var(--warn)") : "var(--text-muted)"
                  }}>{v ? "👍 Sí" : "👎 No"}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={() => setEditandoProveedor(null)} style={{ flex: 1, background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "var(--text-muted)" }}>Cancelar</button>
              <button onClick={() => handleEditar(form.id, { nombre: form.nombre, categoria: form.categoria, telefono: form.telefono, descripcion: form.descripcion, recomienda: form.recomienda })} style={{ flex: 2, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Guardar cambios</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 3 }}>Panel Administrador</p>
              <h1 className="serif" style={{ fontSize: 26 }}>{cond?.nombre}</h1>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <select value={condominioActivo} onChange={e => setCondominioActivo(e.target.value)}
                style={{ ...inputStyle, width: "auto", fontSize: 13, fontWeight: 600 }}>
                {condominios.map(c => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
              </select>
              <button onClick={onLogout} style={{
                background: "var(--warn-light)", color: "var(--warn)", border: "none",
                borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit"
              }}>Cerrar sesión</button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Pendientes", val: pendientes.length, bg: "var(--gold-light)", color: "var(--gold)" },
              { label: "Aprobados", val: aprobados.length, bg: "var(--accent-light)", color: "var(--accent)" },
              { label: "Total", val: proveedores.length, bg: "var(--surface)", color: "var(--text)" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "14px 18px" }}>
                <p style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: "'DM Serif Display', serif" }}>{s.val}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 4, display: "inline-flex", gap: 2, marginBottom: 24 }}>
            <TabBtn id="proveedores" label={`📋 Proveedores ${pendientes.length > 0 ? `(${pendientes.length} pendiente${pendientes.length > 1 ? "s" : ""})` : ""}`} />
            <TabBtn id="configuracion" label="⚙️ Configuración" />
          </div>

          {/* Tab Proveedores */}
          {tab === "proveedores" && (
            cargando ? <Cargando mensaje="Cargando proveedores..." /> :
            <div>
              {pendientes.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <h3 className="serif" style={{ fontSize: 18, marginBottom: 12 }}>⏳ Pendientes <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-muted)" }}>({pendientes.length})</span></h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {pendientes.map(p => <FilaProveedor key={p.id} p={p} esPendiente />)}
                  </div>
                </div>
              )}
              <div>
                <h3 className="serif" style={{ fontSize: 18, marginBottom: 12 }}>✅ Aprobados <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-muted)" }}>({aprobados.length})</span></h3>
                {aprobados.length === 0
                  ? <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Sin proveedores aprobados aún.</p>
                  : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {aprobados.map(p => <FilaProveedor key={p.id} p={p} esPendiente={false} />)}
                  </div>
                }
              </div>
            </div>
          )}

          {/* Tab Configuración */}
          {tab === "configuracion" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "22px 24px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>🏠 Nombre del condominio</h3>
                <input style={inputStyle} value={editando.nombre} onChange={e => setEditando(p => ({ ...p, nombre: e.target.value }))} />
              </div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "22px 24px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>🎨 Paleta de colores</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>El color se aplica a botones, badges y acentos de la vista pública.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                  {PALETAS.map(p => {
                    const seleccionada = editando.colores.accent === p.accent;
                    return (
                      <button key={p.nombre} onClick={() => setEditando(prev => ({ ...prev, colores: { accent: p.accent, accentLight: p.accentLight, bg: p.bg, surface: p.surface, border: p.border } }))}
                        style={{ border: `2px solid ${seleccionada ? p.accent : "var(--border)"}`, borderRadius: 12, padding: "12px 10px", cursor: "pointer", background: seleccionada ? p.accentLight : "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.2s", fontFamily: "inherit" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: p.accent, boxShadow: `0 2px 8px ${p.accent}66` }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: seleccionada ? p.accent : "var(--text-muted)" }}>{p.nombre}</span>
                        {seleccionada && <span style={{ fontSize: 10, color: p.accent }}>✓ Activa</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "22px 24px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>📂 Categorías</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Activa/desactiva categorías o crea nuevas personalizadas.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                  {todasCats.map(cat => {
                    const activa = editando.categorias_activas.includes(cat.id);
                    return (
                      <div key={cat.id} style={{ display: "flex", alignItems: "center" }}>
                        <button onClick={() => setEditando(prev => ({ ...prev, categorias_activas: activa ? prev.categorias_activas.filter(c => c !== cat.id) : [...prev.categorias_activas, cat.id] }))} style={{ background: activa ? "var(--accent-light)" : "var(--bg)", color: activa ? "var(--accent)" : "var(--text-muted)", border: `2px solid ${activa ? "var(--accent)" : "var(--border)"}`, borderRadius: cat.custom ? "999px 0 0 999px" : 999, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit", borderRight: cat.custom ? "none" : undefined }}>{cat.emoji} {cat.label} {activa ? "✓" : "+"}</button>
                        {cat.custom && <button onClick={() => handleEliminarCategoria(cat.id)} style={{ background: "var(--warn-light)", color: "var(--warn)", border: `2px solid ${activa ? "var(--accent)" : "var(--border)"}`, borderLeft: "1px solid var(--border)", borderRadius: "0 999px 999px 0", padding: "7px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", lineHeight: 1 }}>✕</button>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>+ Nueva categoría personalizada</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div style={{ position: "relative" }}>
                      <button onClick={() => setMostrarEmojis(m => !m)} style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>{nuevaCat.emoji}</button>
                      {mostrarEmojis && (
                        <div style={{ position: "absolute", top: "110%", left: 0, zIndex: 10, background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, padding: 10, boxShadow: "var(--shadow)", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, width: 200 }}>
                          {EMOJIS_SUGERIDOS.map(e => (
                            <button key={e} onClick={() => { setNuevaCat(p => ({ ...p, emoji: e })); setMostrarEmojis(false); }} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 4, borderRadius: 6, lineHeight: 1 }} onMouseEnter={ev => ev.currentTarget.style.background = "var(--accent-light)"} onMouseLeave={ev => ev.currentTarget.style.background = "none"}>{e}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input style={{ ...inputStyle, flex: 1, minWidth: 160 }} placeholder="Ej: Cerrajero, Pintor, Mudanzas..." value={nuevaCat.label} onChange={e => { setNuevaCat(p => ({ ...p, label: e.target.value })); setCatError(""); }} onKeyDown={e => e.key === "Enter" && handleAgregarCategoria()} />
                    <button onClick={handleAgregarCategoria} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Agregar</button>
                  </div>
                  {catError && <p style={{ fontSize: 12, color: "var(--warn)", marginTop: 8 }}>⚠ {catError}</p>}
                </div>
              </div>
              <button onClick={handleGuardarCondominio} style={{ background: guardado ? "#27AE60" : "var(--accent)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.3s" }}>{guardado ? "✓ ¡Configuración guardada!" : "Guardar configuración"}</button>
            </div>
          )}
        </div>
      </div>
      {editandoProveedor && <ModalEditarProveedor />}
    </>
  );
};

// ── App Principal ─────────────────────────────────────────────────
export default function App() {
  const [condominios, setCondominios] = useState([]);
  const [todasCats, setTodasCats] = useState(TODAS_CATEGORIAS);
  const [cargandoApp, setCargandoApp] = useState(true);
  const [adminToken, setAdminToken] = useState(null);
  const [vista, setVista] = useState("publica");

  // Detectar ruta actual
  const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
  const esAdmin = path === "admin";

  useEffect(() => {
    const init = async () => {
      const [conds, catsCustom] = await Promise.all([
        query("condominios"),
        query("categorias_custom"),
      ]);
      const condsList = Array.isArray(conds) ? conds : [];
      const catsList = Array.isArray(catsCustom) ? catsCustom.map(c => ({ ...c, custom: true })) : [];
      setCondominios(condsList);
      setTodasCats([...TODAS_CATEGORIAS, ...catsList]);
      setCargandoApp(false);
    };
    init();
  }, []);

  const handleActualizarCondominio = (datos) => {
    setCondominios(prev => prev.map(c => c.slug === datos.slug ? datos : c));
  };

  const handleLogout = async () => {
    if (adminToken) await authLogout(adminToken);
    setAdminToken(null);
  };

  if (cargandoApp) {
    return (
      <>
        <style>{defaultCSS}</style>
        <Cargando mensaje="Iniciando aplicación..." />
      </>
    );
  }

  // ── Ruta /admin ───────────────────────────────────────────────
  if (esAdmin) {
    const adminCSS = buildCSS({
      accent: "#3D4F6B",
      accentLight: "#D9DEE8",
      bg: "#F2F3F5",
      surface: "#FAFAFA",
      border: "#DDE0E6"
    });
    return (
      <>
        <style>{adminCSS}</style>
        {!adminToken
          ? <LoginAdmin onLogin={setAdminToken} />
          : <PanelAdmin
              condominios={condominios}
              todasCats={todasCats}
              setTodasCats={setTodasCats}
              onActualizarCondominio={handleActualizarCondominio}
              adminToken={adminToken}
              onLogout={handleLogout}
            />
        }
      </>
    );
  }

  // ── Ruta /:slug-condominio ────────────────────────────────────
  const cond = condominios.find(c => c.slug === path);

  if (!cond) {
    return (
      <>
        <style>{defaultCSS}</style>
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", maxWidth: 380 }}>
            <p style={{ fontSize: 48 }}>🏠</p>
            <h2 className="serif" style={{ fontSize: 26, marginTop: 16 }}>Condominio no encontrado</h2>
            <p style={{ color: "var(--text-muted)", marginTop: 10, lineHeight: 1.6 }}>
              La URL no corresponde a ningún condominio registrado.
            </p>
          </div>
        </div>
      </>
    );
  }

  const css = buildCSS(cond.colores);

  return (
    <>
      <style>{css}</style>
      {vista === "publica" && <VistaPublica condominio={cond} todasCats={todasCats} onProponer={() => setVista("formulario")} />}
      {vista === "formulario" && <FormularioPropuesta condominio={cond} todasCats={todasCats} onVolver={() => setVista("publica")} />}
    </>
  );
}