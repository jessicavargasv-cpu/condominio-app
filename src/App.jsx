import { useState, useEffect, useRef } from "react";
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs";
import {
  Wrench, Zap, Flame, Scissors, Eye, Leaf, Waves, Bug,
  PawPrint, Dog, Cat,
  Car, CircleDot, Gauge,
  HeartPulse, Baby, Users,
  FileText, Package, MoreHorizontal,
  Search, ChevronDown, ChevronRight, ArrowRight, Phone, Star, Shield,
  PlusCircle, X, MessageCircle, Mail, EyeOff, Menu, SlidersHorizontal
} from "lucide-react";

// ── Hook: detección mobile ────────────────────────────────────────
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

// ── CONFIGURACIÓN SUPABASE ────────────────────────────────────────
const SUPABASE_URL = "https://gztkowyoztqupeplhvev.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6dGtvd3lvenRxdXBlcGxodmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTA3NTksImV4cCI6MjA4OTQyNjc1OX0.MiUvxkuexamCavTRGoL-xCvmdpe6X0R8CClPKRHQNJI";

const ADMIN_EMAIL = "admin.appx@gmail.com";

// ── API Supabase ──────────────────────────────────────────────────
const query = async (table, options = {}) => {
  const { filter, insert, update, remove, select = "*" } = options;
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
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

const authResetPassword = async (email) => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ email }),
  });
  return res.ok;
};

const authLogin = async (email, password) => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

const authLogout = async (token) => {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
};

// ── Mapa íconos ───────────────────────────────────────────────────
const ICONOS_CAT = {
  caldera: Flame, limpia_vidrios: Eye, costura: Scissors,
  gasfiter: Wrench, electricista: Zap, jardin: Leaf,
  piscina: Waves, fumigaciones: Bug,
  veterinario: PawPrint, catsitter: Cat, entrenador_perros: Dog,
  lavado_automvil: Car, mantencin_autos: Gauge, mecnico: Wrench, vulcanizacin: CircleDot,
  cortinas: Package, mueblista: Package,
  babysitter: Baby, enfermera: HeartPulse,
  asesor_isapre: FileText, otro: MoreHorizontal,
  default: Package,
};

const IconoChat = ({ size = 28, fill = "var(--accent)" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect x="0" y="0" width="100" height="80" rx="20" fill={fill}/>
    <polygon points="22,80 22,100 42,80" fill={fill}/>
    <circle cx="25" cy="40" r="9" fill="white"/>
    <circle cx="50" cy="40" r="9" fill="white"/>
    <circle cx="75" cy="40" r="9" fill="white"/>
  </svg>
);

const IconoCat = ({ id, size = 18, color = "currentColor" }) => {
  const Ic = ICONOS_CAT[id] || ICONOS_CAT.default;
  return <Ic size={size} color={color} strokeWidth={1.75} />;
};

// ── Grupos (legacy — referencia para migración) ───────────────────
const GRUPOS = [
  { id: "hogar",      label: "Hogar",             Icon: Wrench },
  { id: "jardin",     label: "Jardín",             Icon: Leaf },
  { id: "mascotas",   label: "Mascotas",           Icon: PawPrint },
  { id: "automotriz", label: "Automotriz",         Icon: Car },
  { id: "personas",   label: "Personas y Cuidado", Icon: Users },
  { id: "asesorias",  label: "Asesorías",          Icon: FileText },
  { id: "otros",      label: "Otros",              Icon: Package },
];

// ── Mapa icono string → componente Lucide ────────────────────────
const ICONOS_GRUPO = {
  "wrench":     Wrench,
  "leaf":       Leaf,
  "paw-print":  PawPrint,
  "car":        Car,
  "users":      Users,
  "file-text":  FileText,
  "package":    Package,
  "zap":        Zap,
  "heart-pulse": HeartPulse,
  "scissors":   Scissors,
  "waves":      Waves,
  "gauge":      Gauge,
};

// ── Categorías base ───────────────────────────────────────────────
const TODAS_CATEGORIAS = [
  { id: "caldera",        label: "Caldera",        emoji: "🔥", grupo: "hogar" },
  { id: "limpia_vidrios", label: "Limpia vidrios", emoji: "🪟", grupo: "hogar" },
  { id: "costura",        label: "Costura",        emoji: "🧵", grupo: "hogar" },
  { id: "gasfiter",       label: "Gasfíter",       emoji: "🔧", grupo: "hogar" },
  { id: "electricista",   label: "Electricista",   emoji: "⚡", grupo: "hogar" },
  { id: "jardin",         label: "Jardín",         emoji: "🌿", grupo: "jardin" },
  { id: "otro",           label: "Otro",           emoji: "📋", grupo: "otros" },
];

const PALETAS = [
  { nombre: "Bosque",    accent: "#2D6A4F", accentLight: "#D8EFE4", bg: "#F5F2EC", surface: "#FDFBF7", border: "#E2DDD4" },
  { nombre: "Océano",    accent: "#1A4A7A", accentLight: "#D6E8F7", bg: "#F0F4F8", surface: "#FAFCFF", border: "#D0DCE8" },
  { nombre: "Terracota", accent: "#9B3922", accentLight: "#F7E0DA", bg: "#FAF5F2", surface: "#FFFCFB", border: "#EADDD8" },
  { nombre: "Pizarra",   accent: "#3D4F6B", accentLight: "#D9DEE8", bg: "#F2F3F5", surface: "#FAFAFA", border: "#DDE0E6" },
  { nombre: "Lavanda",   accent: "#5B4B8A", accentLight: "#EAE5F5", bg: "#F5F3FA", surface: "#FDFCFF", border: "#E0DBF0" },
  { nombre: "Dorado",    accent: "#8B6914", accentLight: "#F5EDD0", bg: "#FAF8F0", surface: "#FFFDF5", border: "#EDE5CC" },
];

const EMOJIS_SUGERIDOS = [
  "🏠","🔧","⚡","🪟","🧵","🔥","🚿","🛁","🪞","🔑","🛗","🧹","🧺","🪣","🛋️","🪴",
  "🌿","🌱","🌳","🌸","💐","🍃","🌾","🪻","🌻","🪨","🏡",
  "🐾","🐕","🐈","🐩","🦮","🐠","🐦","🐇","🦜",
  "🚗","🔩","🛞","🏎️","🚙","⛽","🪛","🔋","🛻",
  "👩‍⚕️","💊","🩺","👶","🧒","👧","🧓","💆","🏋️","🧘",
  "📋","📊","💼","🖥️","📡","🔒","📦","🧯","📱","🗂️","✂️","🎨",
];

// ── CSS Builder ───────────────────────────────────────────────────
const buildCSS = (c, adminMode = false) => `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${c.bg};
    --surface: ${c.surface};
    --border: ${c.border};
    --text: #1C1A16;
    --text-muted: #7A7570;
    --accent: ${c.accent};
    --accent-light: ${c.accentLight};
    --warn: #C0392B;
    --warn-light: #FDECEA;
    --gold: #B5860D;
    --gold-light: #FDF3DC;
    --radius: 14px;
    --shadow: 0 2px 16px rgba(28,26,22,0.07);
    --shadow-md: 0 8px 32px rgba(28,26,22,0.13);
    --sidebar-w: 220px;
  }
  body { background: var(--bg); font-family: ${adminMode ? "'Inter', sans-serif" : "'DM Sans', sans-serif"}; color: var(--text); }
  .serif { font-family: 'DM Serif Display', serif; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px);} to { opacity:1; transform:translateY(0);} }
  .fade-up { animation: fadeUp 0.35s ease forwards; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.8s linear infinite; display: inline-block; }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  .fade-in { animation: fadeIn 0.2s ease forwards; }
  @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  .slide-down { animation: slideDown 0.2s ease forwards; }
`;

const defaultCSS = buildCSS({ accent: "#4A7C6F", accentLight: "#D4EAE5", bg: "#F6F7F5", surface: "#FFFFFF", border: "#E4E8E4" });

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)",
  borderRadius: 10, fontSize: 14, background: "var(--surface)",
  color: "var(--text)", outline: "none", fontFamily: "inherit",
};
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
  letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, display: "block",
};

// ── Footer ────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{
    borderTop: "1px solid var(--border)", background: "var(--surface)",
    padding: "18px 32px", textAlign: "center",
    fontSize: 12, color: "var(--text-muted)",
  }}>
    Copyright © 2026 <strong style={{ color: "var(--text)" }}>1dato</strong> | Todos los derechos reservados
  </footer>
);

// ── Spinner ───────────────────────────────────────────────────────
const Cargando = ({ mensaje = "Cargando..." }) => (
  <div style={{ minHeight: "40vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "var(--text-muted)" }}>
    <span className="spin" style={{ fontSize: 24 }}>⟳</span>
    <p style={{ fontSize: 13 }}>{mensaje}</p>
  </div>
);

// ── Badge categoría ───────────────────────────────────────────────
const Badge = ({ categoriaId, todasCats }) => {
  const cat = todasCats.find(c => c.id === categoriaId);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "var(--accent-light)", color: "var(--accent)",
      fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
      padding: "3px 10px", borderRadius: 999, textTransform: "uppercase",
    }}>
      <IconoCat id={categoriaId} size={11} color="var(--accent)" />
      {cat?.label}
    </span>
  );
};

// ── Insert público (sin Authorization, rol anon) ──────────────────
const insertPublico = async (table, data) => {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });
};

// ── Registrar evento ─────────────────────────────────────────────
const registrarEvento = async (proveedorId, condominio, tipo) => {
  try {
    await insertPublico("eventos", { proveedor_id: proveedorId, condominio, tipo });
  } catch (e) { /* silencioso */ }
};

// ── Helpers valoraciones ──────────────────────────────────────────
const COOKIE_KEY = "1dato_valoraciones";
const getCookieVal = () => { try { return JSON.parse(localStorage.getItem(COOKIE_KEY) || "{}"); } catch { return {}; } };
const setCookieVal = (obj) => { try { localStorage.setItem(COOKIE_KEY, JSON.stringify(obj)); } catch {} };
const yaValoro = (proveedorId) => !!getCookieVal()[proveedorId];
const marcarValorado = (proveedorId) => { const v = getCookieVal(); v[proveedorId] = true; setCookieVal(v); };

// ── Modal Valoración ──────────────────────────────────────────────
const ModalValoracion = ({ p, todasCats, onCerrar, onValorado }) => {
  const [estrellas, setEstrellas] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [valoraciones, setValoraciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  // Bug 1 fix: evaluar yaVoto una sola vez al montar, no en cada render
  const [yaVoto] = useState(() => yaValoro(p.id));

  useEffect(() => {
    query("valoraciones", { filter: `proveedor_id=eq.${p.id}` })
      .then(data => { setValoraciones(Array.isArray(data) ? data : []); setCargando(false); });
  }, [p.id]);

  const promedio = valoraciones.length > 0
    ? (valoraciones.reduce((s, v) => s + v.estrellas, 0) / valoraciones.length).toFixed(1)
    : null;

  const handleEnviar = async () => {
    if (!estrellas || enviando) return;
    setEnviando(true);
    await query("valoraciones", { insert: { proveedor_id: p.id, estrellas, comentario: comentario.trim() || null } });
    marcarValorado(p.id);
    // Recargar valoraciones del modal para mostrar promedio actualizado
    const updated = await query("valoraciones", { filter: `proveedor_id=eq.${p.id}` });
    if (Array.isArray(updated)) setValoraciones(updated);
    setEnviado(true);
    setEnviando(false);
    // Notificar a la tarjeta para que recargue sus valoraciones
    if (onValorado) onValorado();
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onCerrar()}
      style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="fade-up" style={{ background: "var(--surface)", borderRadius: 16, boxShadow: "var(--shadow-md)", padding: "28px 32px", width: "100%", maxWidth: 420 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 4 }}>
              {todasCats.find(c => c.id === p.categoria)?.label}
            </p>
            <h3 className="serif" style={{ fontSize: 22 }}>{p.nombre}</h3>
          </div>
          <button onClick={onCerrar} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Promedio actual — ocultar si ya votó y aún no hay promedio */}
        {!cargando && !(( enviado || yaVoto) && !promedio) && (
          <div style={{ background: "var(--bg)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            {promedio ? (
              <>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1,2,3,4,5,6,7].map(n => (
                    <span key={n} style={{ fontSize: 16, color: n <= Math.round(parseFloat(promedio)) ? "var(--gold)" : "var(--border)" }}>★</span>
                  ))}
                </div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text)" }}>{promedio}</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 4 }}>/7</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>({valoraciones.length} vecino{valoraciones.length !== 1 ? "s" : ""})</span>
                </div>
              </>
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Sin valoraciones aún. ¡Sé el primero!</p>
            )}
          </div>
        )}

        {/* Formulario o mensaje */}
        {enviado || yaVoto ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 10 }}>🙌</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
              {enviado ? "¡Gracias por tu valoración!" : "Ya valoraste este servicio"}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Tu opinión ayuda a toda la comunidad.</p>
            <button onClick={onCerrar} style={{ marginTop: 16, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cerrar</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ ...labelStyle, marginBottom: 10 }}>Tu puntuación *</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[1,2,3,4,5,6,7].map(n => (
                  <button key={n}
                    onClick={() => setEstrellas(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 28, padding: 2, transition: "transform 0.1s", transform: (hover || estrellas) >= n ? "scale(1.15)" : "scale(1)" }}
                  >
                    <span style={{ color: n <= (hover || estrellas) ? "var(--gold)" : "var(--border)" }}>★</span>
                  </button>
                ))}
              </div>
              {estrellas > 0 && (
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                  {["","Muy malo","Malo","Regular","Aceptable","Bueno","Muy bueno","Excelente"][estrellas]}
                </p>
              )}
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Comentario (opcional)</label>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{comentario.length}/200</span>
              </div>
              <textarea
                style={{ ...inputStyle, resize: "none", height: 72 }}
                value={comentario}
                onChange={e => setComentario(e.target.value.slice(0, 200))}
                placeholder="¿Algo que destacar sobre este servicio?"
              />
            </div>
            <button onClick={handleEnviar} disabled={!estrellas || enviando} style={{
              background: (!estrellas || enviando) ? "var(--border)" : "var(--accent)",
              color: (!estrellas || enviando) ? "var(--text-muted)" : "#fff",
              border: "none", borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 600,
              cursor: (!estrellas || enviando) ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>
              {enviando ? "⟳ Enviando..." : "Enviar valoración"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Tarjeta servicio ──────────────────────────────────────────────
const ServicioCard = ({ p, todasCats, condominio }) => {
  const [modalVal, setModalVal] = useState(false);
  const [valoraciones, setValoraciones] = useState(null); // null = cargando, [] = sin datos

  const cargarValoraciones = () => {
    query("valoraciones", { filter: `proveedor_id=eq.${p.id}`, select: "estrellas" })
      .then(data => setValoraciones(Array.isArray(data) ? data : []));
  };

  useEffect(() => { cargarValoraciones(); }, [p.id]);

  // null = aún cargando (no mostrar nada), [] = cargado sin valoraciones
  const cargandoVal = valoraciones === null;
  const promedio = !cargandoVal && valoraciones.length > 0
    ? (valoraciones.reduce((s, v) => s + v.estrellas, 0) / valoraciones.length).toFixed(1)
    : null;

  return (
    <>
      <div className="fade-up" style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: "18px 20px",
        boxShadow: "var(--shadow)", display: "flex", flexDirection: "column", gap: 8,
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: 14 }}>{p.nombre}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <a href={`tel:${p.telefono.replace(/\s/g, "")}`}
                onClick={() => registrarEvento(p.id, p.condominio, "contacto")}
                style={{ color: "var(--text-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 4, textDecoration: "none", whiteSpace: "nowrap" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              >
                <Phone size={10} strokeWidth={2} style={{ flexShrink: 0 }} /> {p.telefono}
              </a>
              <a
                href={`https://wa.me/${p.telefono.replace(/\D/g, "").replace(/^0/, "")}`}
                target="_blank" rel="noreferrer"
                onClick={() => registrarEvento(p.id, p.condominio, "contacto")}
                title="Escribir por WhatsApp"
                style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: "#25D366", textDecoration: "none", background: "#E8FBF0", borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap", flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.background = "#C8F5DC"}
                onMouseLeave={e => e.currentTarget.style.background = "#E8FBF0"}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WA
              </a>
            </div>
          </div>
          <Badge categoriaId={p.categoria} todasCats={todasCats} />
        </div>
        {p.descripcion && <p style={{ fontSize: 12, color: "#4A4540", lineHeight: 1.6 }}>{p.descripcion}</p>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 2 }}>
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: p.recomienda ? "var(--accent)" : "var(--warn)",
            background: p.recomienda ? "var(--accent-light)" : "var(--warn-light)",
            padding: "2px 8px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            {p.recomienda ? <><Star size={9} strokeWidth={2} /> Recomendado</> : "👎 No recomendado"}
          </span>
          <button onClick={() => setModalVal(true)} style={{
            background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
            color: promedio ? "var(--gold)" : "var(--text-muted)", fontSize: 11, fontFamily: "inherit", padding: "2px 6px",
            borderRadius: 6, transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <span style={{ fontSize: 13, color: promedio ? "var(--gold)" : "var(--text-muted)" }}>★</span>
            {cargandoVal
              ? null
              : promedio
                ? <span style={{ fontWeight: 600 }}>{promedio}/7 <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({valoraciones.length} vecino{valoraciones.length !== 1 ? "s" : ""})</span></span>
                : <span>Valorar</span>
            }
          </button>
        </div>
      </div>
      {modalVal && <ModalValoracion p={p} todasCats={todasCats} onCerrar={() => setModalVal(false)} onValorado={cargarValoraciones} />}
    </>
  );
};

// ── Modal Búsqueda ────────────────────────────────────────────────
const ModalBusqueda = ({ servicios, todasCats, onCerrar, onSeleccionar }) => {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const resultados = q.trim().length < 2 ? [] : servicios.filter(p =>
    p.estado === "aprobado" && (
      p.nombre.toLowerCase().includes(q.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(q.toLowerCase()) ||
      todasCats.find(c => c.id === p.categoria)?.label.toLowerCase().includes(q.toLowerCase())
    )
  ).slice(0, 8);

  return (
    <div onClick={e => e.target === e.currentTarget && onCerrar()}
      style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.45)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80, padding: "80px 24px 24px" }}>
      <div className="slide-down" style={{ width: "100%", maxWidth: 560, background: "var(--surface)", borderRadius: 16, boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
        {/* Input */}
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <Search size={18} color="var(--text-muted)" strokeWidth={1.75} style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="¿Qué servicio estás buscando?"
            style={{ flex: 1, border: "none", outline: "none", fontSize: 15, background: "transparent", fontFamily: "inherit", color: "var(--text)" }}
          />
          {q && (
            <button onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 2 }}>
              <X size={16} strokeWidth={2} />
            </button>
          )}
          <button onClick={onCerrar} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>Esc</button>
        </div>

        {/* Resultados */}
        {q.trim().length >= 2 && (
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {resultados.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                Sin resultados para "{q}"
              </div>
            ) : (
              resultados.map(p => (
                <div key={p.id} onClick={() => { onSeleccionar(p.categoria); onCerrar(); }}
                  style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconoCat id={p.categoria} size={16} color="var(--accent)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>{p.nombre}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{todasCats.find(c => c.id === p.categoria)?.label} · {p.telefono}</p>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" strokeWidth={2} />
                </div>
              ))
            )}
          </div>
        )}

        {q.trim().length < 2 && (
          <div style={{ padding: "20px 16px", color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>
            Escribe al menos 2 caracteres para buscar
          </div>
        )}
      </div>
    </div>
  );
};

// ── Modal Contáctanos ─────────────────────────────────────────────
const ModalContacto = ({ condominio, onCerrar }) => {
  const whatsappMsg = encodeURIComponent(`Hola, tengo una consulta sobre el directorio de servicios de ${condominio.nombre}`);
  return (
    <div onClick={e => e.target === e.currentTarget && onCerrar()}
      style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="fade-up" style={{ background: "var(--surface)", borderRadius: 16, boxShadow: "var(--shadow-md)", padding: "32px", width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <MessageCircle size={22} color="var(--accent)" strokeWidth={1.75} />
        </div>
        <h3 className="serif" style={{ fontSize: 24, marginBottom: 8 }}>Contáctanos</h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 24 }}>
          ¿Tienes dudas sobre el directorio o quieres reportar algo? Contáctate con el administrador de <strong>{condominio.nombre}</strong>.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href={`mailto:${ADMIN_EMAIL}`} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 10,
            padding: "11px 20px", fontSize: 13, fontWeight: 600, color: "var(--text)",
            textDecoration: "none", transition: "border-color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            <Mail size={15} strokeWidth={2} /> {ADMIN_EMAIL}
          </a>
          <a href={`https://wa.me/56900000000?text=${whatsappMsg}`} target="_blank" rel="noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "#25D366", border: "none", borderRadius: 10,
            padding: "11px 20px", fontSize: 13, fontWeight: 600, color: "#fff",
            textDecoration: "none",
          }}>
            <MessageCircle size={15} strokeWidth={2} /> Escribir por WhatsApp
          </a>
        </div>
        <button onClick={onCerrar} style={{ marginTop: 16, background: "none", border: "none", fontSize: 12, color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit" }}>Cerrar</button>
      </div>
    </div>
  );
};

// ── Navbar 1dato ──────────────────────────────────────────────────
const Navbar = ({ condominio, onNavegar, vistaActiva, servicios, todasCats, onProponer }) => {
  const [modalContacto, setModalContacto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const isMobile = useIsMobile();

  const NavLink = ({ id, label }) => (
    <button onClick={() => { onNavegar(id); setMenuAbierto(false); }} style={{
      background: "none", border: "none",
      borderBottom: isMobile ? "none" : `2px solid ${vistaActiva === id ? "var(--accent)" : "transparent"}`,
      padding: isMobile ? "14px 0" : "4px 2px",
      fontSize: isMobile ? 17 : 13,
      fontWeight: vistaActiva === id ? 600 : 400,
      color: vistaActiva === id ? "var(--accent)" : isMobile ? "var(--text)" : "var(--text-muted)",
      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
      whiteSpace: "nowrap", width: isMobile ? "100%" : "auto", textAlign: isMobile ? "center" : "left",
    }}>{label}</button>
  );

  return (
    <>
      <nav style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 100,
        padding: isMobile ? "0 16px" : "0 32px",
        display: "flex", alignItems: "center", gap: 0, height: 56,
      }}>
        {/* Logo 1dato */}
        <button onClick={() => { onNavegar("inicio"); setMenuAbierto(false); }} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginRight: 12,
        }}>
          <IconoChat size={28} />
          <span style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "var(--accent)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.5px" }}>1</span>
            <span style={{ fontSize: 17, fontWeight: 300, color: "var(--text)", fontFamily: "'DM Sans', sans-serif" }}>dato</span>
          </span>
        </button>

        {isMobile ? (
          <>
            {/* Nombre condominio mobile */}
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1A3F2F", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {condominio.nombre}
            </span>
            {/* Botón hamburguesa */}
            <button onClick={() => setMenuAbierto(v => !v)} style={{
              background: "none", border: "none", cursor: "pointer", padding: 8,
              color: "var(--text)", display: "flex", alignItems: "center",
            }}>
              {menuAbierto ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
            </button>
          </>
        ) : (
          <>
            <div style={{ width: 1, height: 28, background: "var(--border)", margin: "0 16px", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1A3F2F", whiteSpace: "nowrap", marginRight: 20, flexShrink: 0 }}>
              {condominio.nombre}
            </span>
            <div style={{ width: 1, height: 28, background: "var(--border)", marginRight: 20, flexShrink: 0 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 22, flex: 1 }}>
              <NavLink id="servicios" label="Servicios" />
              <NavLink id="como_funciona" label="¿Cómo funciona?" />
              <button onClick={onProponer} style={{
                background: "none", border: "none", padding: "4px 2px", fontSize: 13, fontWeight: 400,
                color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit",
                transition: "color 0.15s", whiteSpace: "nowrap",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              >Sugerir servicio</button>
              <button onClick={() => setModalContacto(true)} style={{
                background: "none", border: "none", padding: "4px 2px", fontSize: 13, fontWeight: 400,
                color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit",
                transition: "color 0.15s", whiteSpace: "nowrap",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              >Contáctanos</button>
            </div>
          </>
        )}
      </nav>

      {/* Menú mobile desplegable */}
      {isMobile && menuAbierto && (
        <>
          <div onClick={() => setMenuAbierto(false)} style={{
            position: "fixed", inset: 0, zIndex: 98, background: "rgba(0,0,0,0.35)",
          }} />
          <div style={{
            position: "fixed", top: 56, left: 0, right: 0, zIndex: 99,
            background: "var(--surface)", borderBottom: "1px solid var(--border)",
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "8px 24px 24px", gap: 4,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}>
            <NavLink id="servicios" label="Servicios" />
            <NavLink id="como_funciona" label="¿Cómo funciona?" />
            <button onClick={() => { onProponer(); setMenuAbierto(false); }} style={{
              background: "none", border: "none", padding: "14px 0", fontSize: 17, fontWeight: 400,
              color: "var(--text)", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "center",
            }}>Sugerir servicio</button>
            <button onClick={() => { setModalContacto(true); setMenuAbierto(false); }} style={{
              background: "none", border: "none", padding: "14px 0", fontSize: 17, fontWeight: 400,
              color: "var(--text)", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "center",
            }}>Contáctanos</button>
          </div>
        </>
      )}

      {modalContacto && <ModalContacto condominio={condominio} onCerrar={() => setModalContacto(false)} />}
    </>
  );
};

// ── Hero ──────────────────────────────────────────────────────────
const Hero = ({ condominio, onNavegar }) => {
  const isMobile = useIsMobile();
  return (
    <div style={{
      background: "linear-gradient(135deg, var(--surface) 0%, var(--accent-light) 60%, var(--accent-light) 100%)",
      flex: 1,
      display: "flex", alignItems: "center", justifyContent: "center",
      textAlign: "center", position: "relative", overflow: "hidden",
      padding: isMobile ? "36px 20px" : "48px 32px",
      minHeight: isMobile ? "auto" : undefined,
    }}>
      <div style={{ position: "absolute", top: -80, right: -100, width: 500, height: 400, borderRadius: "50%", background: "var(--accent)", opacity: 0.06, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: -80, width: 400, height: 300, borderRadius: "50%", background: "var(--accent)", opacity: 0.05, pointerEvents: "none" }} />
      <div className="fade-up" style={{ position: "relative", zIndex: 1, maxWidth: 600 }}>
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: isMobile ? 14 : 18, fontWeight: 600, color: "var(--accent)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em" }}>
            {condominio.nombre}{condominio.comuna ? <span style={{ fontWeight: 600, color: "var(--accent)" }}> · {condominio.comuna}</span> : null}
          </p>
        </div>
        <h1 className="serif" style={{ fontSize: isMobile ? 34 : 54, lineHeight: 1.15, marginBottom: isMobile ? 14 : 20, color: "var(--text)" }}>
          Cuando un vecino tiene{isMobile ? " " : <br />}el dato, todos ganan
        </h1>
        <p style={{ fontSize: isMobile ? 14 : 17, color: "var(--text-muted)", lineHeight: 1.65, maxWidth: 440, margin: isMobile ? "0 auto 24px" : "0 auto 36px" }}>
          El directorio de servicios que recomiendan tus propios vecinos.
        </p>
        <button onClick={() => onNavegar("servicios")} style={{
          background: "var(--accent)", color: "#fff", border: "none",
          borderRadius: 10, padding: isMobile ? "12px 24px" : "14px 32px",
          fontSize: isMobile ? 14 : 15, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit", display: "inline-flex",
          alignItems: "center", gap: 8, transition: "opacity 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Ver servicios <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

// ── Cómo Funciona ─────────────────────────────────────────────────
const ComoFunciona = ({ onProponer }) => {
  const pasos = [
    { Icon: Search,     titulo: "Explora los servicios",  desc: "Navega por categorías y encuentra el tipo de servicio que necesitas para tu hogar." },
    { Icon: Shield,     titulo: "Revisa el servicio",     desc: "Lee la descripción y la recomendación de tus propios vecinos antes de decidir." },
    { Icon: Phone,      titulo: "Contáctalo en 1 clic",   desc: "Escríbele directo por WhatsApp o llámalo al instante. Sin intermediarios." },
    { Icon: PlusCircle, titulo: "Sugiere un servicio",    desc: "¿Conoces uno bueno? Compártelo con tu comunidad y ayuda a tus vecinos." },
  ];
  return (
    <div style={{ padding: "56px 32px 72px" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }} className="fade-up">
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>Directorio vecinal</p>
        <h2 className="serif" style={{ fontSize: 36, lineHeight: 1.2, marginBottom: 14 }}>¿Cómo funciona?</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.65, maxWidth: 480, margin: "0 auto" }}>
          Un directorio de servicios verificados por tus propios vecinos. Simple, confiable y sin publicidad.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 48 }}>
        {pasos.map((paso, i) => (
          <div key={i} className="fade-up" style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: "28px 24px",
            boxShadow: "var(--shadow)", textAlign: "center", animationDelay: `${i * 0.1}s`,
          }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <paso.Icon size={22} color="var(--accent)" strokeWidth={1.75} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Paso {i + 1}</div>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{paso.titulo}</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65 }}>{paso.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>¿Conoces un buen servicio? Compártelo con tu comunidad.</p>
        <button onClick={onProponer} style={{
          background: "var(--accent)", color: "#fff", border: "none",
          borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8,
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Sugerir un servicio <ArrowRight size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

// ── Vista Servicios ───────────────────────────────────────────────
const VistaServicios = ({ condominio, grupos, categorias, servicios, cargando, filtroGrupoInicial, filtroCatInicial }) => {
  const [grupoActivo, setGrupoActivo] = useState(filtroGrupoInicial || grupos[0]?.id || "");
  const [catActiva, setCatActiva] = useState(filtroCatInicial || null);
  const [acordeonesAbiertos, setAcordeonesAbiertos] = useState({});
  const [modalBusqueda, setModalBusqueda] = useState(false);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const acordeonRefs = useRef({});
  const isMobile = useIsMobile();

  // Sincronizar si llegan filtros externos (desde búsqueda)
  useEffect(() => {
    if (filtroGrupoInicial) setGrupoActivo(filtroGrupoInicial);
    if (filtroCatInicial) {
      setCatActiva(filtroCatInicial);
      const cat = categorias.find(c => c.id === filtroCatInicial);
      if (cat) setGrupoActivo(cat.grupo_id);
      setAcordeonesAbiertos(prev => ({ ...prev, [filtroCatInicial]: true }));
      setTimeout(() => {
        acordeonRefs.current[filtroCatInicial]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, [filtroGrupoInicial, filtroCatInicial]);

  const serviciosAprobados = servicios.filter(s => s.estado === "aprobado");

  // Grupos con categorías activas del condominio
  const gruposConCats = grupos.map(g => ({
    ...g,
    cats: categorias.filter(c => c.grupo_id === g.id && c.activa),
  })).filter(g => g.cats.length > 0);

  // Contar servicios por grupo
  const contarGrupo = (grupoId) => {
    const cats = categorias.filter(c => c.grupo_id === grupoId && c.activa);
    return serviciosAprobados.filter(s => cats.some(c => c.id === s.categoria)).length;
  };

  // Servicios del grupo activo, por categoría
  const grupoActualObj = gruposConCats.find(g => g.id === grupoActivo);
  const catsDelGrupo = grupoActualObj?.cats || [];

  const toggleAcordeon = (catId) => {
    const abriendo = !acordeonesAbiertos[catId];
    setAcordeonesAbiertos(prev => ({ ...prev, [catId]: !prev[catId] }));
    setCatActiva(catId);
    if (abriendo) {
      const serviciosCat = serviciosAprobados.filter(s => s.categoria === catId);
      serviciosCat.forEach(s => registrarEvento(s.id, condominio.slug, "vista"));
    }
  };

  // Sidebar content reutilizable (desktop y drawer mobile)
  const SidebarContent = ({ onSelectGrupo }) => (
    <>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", padding: "0 16px 10px" }}>Categorías</p>
      {gruposConCats.map(grupo => {
        const activo = grupoActivo === grupo.id;
        const total = contarGrupo(grupo.id);
        const GrupoIcon = ICONOS_GRUPO[grupo.icono] || Package;
        return (
          <button key={grupo.id} onClick={() => { setGrupoActivo(grupo.id); setCatActiva(null); setAcordeonesAbiertos({}); onSelectGrupo?.(); }}
            style={{
              width: "100%", textAlign: "left", background: activo ? "var(--accent-light)" : "none",
              border: "none", padding: "10px 16px", cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s",
              borderLeft: `3px solid ${activo ? "var(--accent)" : "transparent"}`,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: activo ? "var(--accent)" : "var(--bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid ${activo ? "var(--accent)" : "var(--border)"}`,
            }}>
              <GrupoIcon size={15} color={activo ? "#fff" : "var(--text-muted)"} strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: activo ? 600 : 400, color: activo ? "var(--accent)" : "var(--text)" }}>{grupo.label}</p>
            </div>
            {total > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: activo ? "var(--accent)" : "var(--text-muted)", background: activo ? "var(--accent-light)" : "var(--bg)", border: `1px solid ${activo ? "var(--accent)" : "var(--border)"}`, borderRadius: 999, padding: "1px 7px" }}>{total}</span>
            )}
          </button>
        );
      })}
    </>
  );

  return (
    <div style={{ display: "flex", flex: 1, position: "relative" }}>

      {/* Sidebar desktop */}
      {!isMobile && (
        <div style={{
          width: "var(--sidebar-w)", flexShrink: 0,
          borderRight: "1px solid var(--border)", background: "var(--surface)",
          position: "sticky", top: 56, height: "calc(100vh - 56px)", overflowY: "auto",
          padding: "16px 0",
        }}>
          <SidebarContent />
        </div>
      )}

      {/* Drawer mobile */}
      {isMobile && drawerAbierto && (
        <>
          <div onClick={() => setDrawerAbierto(false)} style={{
            position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)",
          }} />
          <div style={{
            position: "fixed", top: 56, left: 0, bottom: 0, zIndex: 201,
            width: 260, background: "var(--surface)",
            borderRight: "1px solid var(--border)", overflowY: "auto",
            padding: "16px 0",
            boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
          }}>
            <SidebarContent onSelectGrupo={() => setDrawerAbierto(false)} />
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div style={{ flex: 1, padding: isMobile ? "16px 12px" : "24px 32px", overflowX: "hidden" }}>

        {/* Barra superior mobile: botón filtrar + búsqueda */}
        {isMobile && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={() => setDrawerAbierto(true)} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600,
              color: "var(--accent)", cursor: "pointer", fontFamily: "inherit",
            }}>
              <SlidersHorizontal size={14} strokeWidth={2} />
              {gruposConCats.find(g => g.id === grupoActivo)?.label || "Categorías"}
            </button>
            <button onClick={() => setModalBusqueda(true)} style={{
              display: "flex", alignItems: "center", gap: 6, flex: 1,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "8px 14px", fontSize: 13,
              color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit",
            }}>
              <Search size={14} strokeWidth={2} /> Buscar...
            </button>
          </div>
        )}
        {/* Contenido principal — acordeón */}
        {cargando ? <Cargando mensaje="Cargando servicios..." /> : (
          <>
            {grupoActualObj && !isMobile && (
              <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }} className="fade-up">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    {(() => { const GI = ICONOS_GRUPO[grupoActualObj.icono] || Package; return <GI size={20} color="var(--accent)" strokeWidth={1.75} />; })()}
                    <h2 className="serif" style={{ fontSize: 26 }}>{grupoActualObj.label}</h2>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{contarGrupo(grupoActivo)} servicio{contarGrupo(grupoActivo) !== 1 ? "s" : ""} disponible{contarGrupo(grupoActivo) !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setModalBusqueda(true)} style={{
                  background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 10,
                  height: 38, padding: "0 14px", display: "flex", alignItems: "center", gap: 8,
                  cursor: "pointer", transition: "border-color 0.15s", flexShrink: 0, marginTop: 2,
                  fontSize: 13, color: "var(--text-muted)", fontFamily: "inherit",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <Search size={15} color="var(--text-muted)" strokeWidth={2} />
                  Buscar servicio
                </button>
              </div>
            )}
            {modalBusqueda && (
              <ModalBusqueda
                servicios={servicios}
                todasCats={categorias}
                onCerrar={() => setModalBusqueda(false)}
                onSeleccionar={(catId) => {
                  const cat = categorias.find(c => c.id === catId);
                  if (cat) setGrupoActivo(cat.grupo_id);
                  setCatActiva(catId);
                  setAcordeonesAbiertos(prev => ({ ...prev, [catId]: true }));
                  setTimeout(() => acordeonRefs.current[catId]?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
                }}
              />
            )}

            {catsDelGrupo.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No hay categorías activas en este grupo.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {catsDelGrupo.map(cat => {
                  const abierto = acordeonesAbiertos[cat.id] ?? false;
                  const serviciosCat = serviciosAprobados.filter(s => s.categoria === cat.id);
                  const total = serviciosCat.length;
                  if (total === 0) return null;
                  return (
                    <div key={cat.id} ref={el => acordeonRefs.current[cat.id] = el} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
                      {/* Header acordeón */}
                      <button onClick={() => toggleAcordeon(cat.id)} style={{
                        width: "100%", background: "none", border: "none", padding: "16px 20px",
                        display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                        fontFamily: "inherit", transition: "background 0.15s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <IconoCat id={cat.id} size={16} color="var(--accent)" />
                        </div>
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{cat.label}</p>
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 8 }}>
                          {total} servicio{total !== 1 ? "s" : ""}
                        </span>
                        <ChevronDown size={16} color="var(--text-muted)" strokeWidth={2}
                          style={{ transition: "transform 0.2s", transform: abierto ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
                      </button>

                      {/* Contenido acordeón */}
                      {abierto && (
                        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px" }} className="fade-in">
                          {serviciosCat.length === 0 ? (
                            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>Sin servicios en esta categoría aún.</p>
                          ) : (
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                              {serviciosCat.map(p => <ServicioCard key={p.id} p={p} todasCats={categorias} condominio={condominio} />)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ── Vista Pública Principal ───────────────────────────────────────
const VistaPublica = ({ condominio, grupos, categorias, onProponer }) => {
  const [vista, setVista] = useState("inicio");
  const [filtroGrupo, setFiltroGrupo] = useState(null);
  const [filtroCat, setFiltroCat] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const data = await query("proveedores", { filter: `condominio=eq.${condominio.slug}&order=id.desc` });
      setServicios(Array.isArray(data) ? data : []);
      setCargando(false);
    };
    cargar();
  }, [condominio.slug]);

  const navegar = (destino, catId = null) => {
    setVista(destino);
    if (catId) {
      const cat = categorias.find(c => c.id === catId);
      setFiltroGrupo(cat?.grupo_id || null);
      setFiltroCat(catId);
    } else {
      setFiltroGrupo(null);
      setFiltroCat(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Navbar
        condominio={condominio}
        onNavegar={navegar}
        vistaActiva={vista}
        servicios={servicios}
        todasCats={categorias}
        onProponer={onProponer}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {vista === "inicio" && <Hero condominio={condominio} onNavegar={navegar} />}
        {vista === "servicios" && (
          <VistaServicios
            condominio={condominio}
            grupos={grupos}
            categorias={categorias}
            servicios={servicios}
            cargando={cargando}
            filtroGrupoInicial={filtroGrupo}
            filtroCatInicial={filtroCat}
          />
        )}
        {vista === "como_funciona" && <ComoFunciona onProponer={onProponer} />}
      </div>

      <Footer />
    </div>
  );
};

// ── Formulario Sugerir Servicio ───────────────────────────────────
const Logo1dato = ({ onVolver }) => (
  <button onClick={onVolver} style={{
    background: "none", border: "none", cursor: "pointer", padding: 0,
    display: "flex", alignItems: "center", gap: 8,
  }}>
    <IconoChat size={28} />
    <span style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
      <span style={{ fontSize: 17, fontWeight: 700, color: "var(--accent)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.5px" }}>1</span>
      <span style={{ fontSize: 17, fontWeight: 300, color: "var(--text)", fontFamily: "'DM Sans', sans-serif" }}>dato</span>
    </span>
  </button>
);

const FormularioPropuesta = ({ condominio, categorias, onVolver }) => {
  const [form, setForm] = useState({ nombre: "", grupo: "", categoria: "", telefonoLocal: "", descripcion: "", recomienda: true });
  const [telError, setTelError] = useState("");
  const [unicidadError, setUnicidadError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [serviciosCount, setServiciosCount] = useState(0);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cats = categorias.filter(c => c.activa);
  const isMobile = useIsMobile();

  const formatTelefono = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 1) return digits;
    if (digits.length <= 5) return digits.slice(0,1) + " " + digits.slice(1);
    return digits.slice(0,1) + " " + digits.slice(1,5) + " " + digits.slice(5);
  };

  const handleTelChange = (val) => {
    const formatted = formatTelefono(val);
    set("telefonoLocal", formatted);
    const digits = val.replace(/\D/g, "");
    if (!digits) { setTelError(""); return; }
    if (digits.length < 8) setTelError("Mínimo 8 dígitos");
    else if (digits.length > 9) setTelError("Máximo 9 dígitos");
    else setTelError("");
  };

  const telefonoCompleto = form.telefonoLocal ? "+56 " + form.telefonoLocal : "";
  const valido = form.nombre && form.categoria && form.telefonoLocal && !telError && form.telefonoLocal.replace(/\D/g, "").length >= 8;

  useEffect(() => {
    query("proveedores", { filter: `condominio=eq.${condominio.slug}&estado=eq.aprobado`, select: "id" })
      .then(data => setServiciosCount(Array.isArray(data) ? data.length : 0));
  }, [condominio.slug]);

  const handleEnviar = async () => {
    if (!valido) return;
    setEnviando(true);
    setUnicidadError("");
    // Validación unicidad teléfono + categoría
    const existentes = await query("proveedores", {
      filter: `condominio=eq.${condominio.slug}&telefono=eq.${encodeURIComponent(telefonoCompleto)}&categoria=eq.${form.categoria}`,
      select: "id",
    });
    if (Array.isArray(existentes) && existentes.length > 0) {
      setUnicidadError("Ya existe un servicio con este teléfono en esta categoría.");
      setEnviando(false);
      return;
    }
    await query("proveedores", {
      insert: { condominio: condominio.slug, nombre: form.nombre, categoria: form.categoria, telefono: telefonoCompleto, descripcion: form.descripcion, recomienda: form.recomienda, estado: "pendiente" },
    });
    setEnviando(false);
    setEnviado(true);
  };

  const gruposConCats = GRUPOS.map(g => ({ ...g, cats: cats.filter(c => c.grupo === g.id) })).filter(g => g.cats.length > 0);
  const catsDelGrupo = form.grupo ? (gruposConCats.find(g => g.id === form.grupo)?.cats || []) : [];

  if (enviado) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 380 }} className="fade-up">
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Shield size={28} color="var(--accent)" strokeWidth={1.75} />
          </div>
          <h2 className="serif" style={{ fontSize: 28, marginBottom: 10 }}>¡Sugerencia enviada!</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.6, fontSize: 14 }}>
            Un administrador de <strong>{condominio.nombre}</strong> revisará la información antes de publicarla.
          </p>
          <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
            <Logo1dato onVolver={onVolver} />
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>Volver al directorio</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Navbar completo igual al resto de la app */}
      <Navbar
        condominio={condominio}
        onNavegar={(dest) => { if (dest === "inicio" || dest === "servicios" || dest === "como_funciona") onVolver(); }}
        vistaActiva=""
        servicios={[]}
        todasCats={cats}
        onProponer={() => {}}
      />

      <div style={{ flex: 1, padding: isMobile ? "16px 12px" : "32px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.4fr", gap: 24, maxWidth: 1100, margin: "0 auto", width: "100%", flex: 1, alignItems: "stretch" }}>

          {/* Columna izquierda — motivacional (oculta en mobile) */}
          {!isMobile && <div style={{
            background: "linear-gradient(135deg, #ffffff 0%, #e8f5ee 60%, #c8e8d8 100%)",
            border: "1px solid #D4EAE0", borderRadius: "var(--radius)", padding: "36px 32px",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 160, borderRadius: "50%", background: "var(--accent)", opacity: 0.07, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -30, left: -30, width: 160, height: 120, borderRadius: "50%", background: "var(--accent)", opacity: 0.05, pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>Comparte tu dato</p>
              <h2 className="serif" style={{ fontSize: 26, lineHeight: 1.25, color: "#1A3F2F", marginBottom: 12 }}>
                Tu dato vale oro<br />para tus vecinos
              </h2>
              <p style={{ fontSize: 13, color: "#4A7C6F", lineHeight: 1.65, marginBottom: 24 }}>
                ¿Conoces un buen gasfíter, jardinero o electricista? Compártelo con tu comunidad.
              </p>

              <div style={{ borderTop: "1px solid #D4EAE0", paddingTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { icon: "✓", titulo: "Verificado por el admin", desc: "Antes de publicarse en el directorio" },
                  { icon: "👥", titulo: "Visible para tu comunidad", desc: "Todos los vecinos podrán verlo" },
                  { icon: "💡", titulo: "Ayuda a quien lo necesita", desc: "Tu dato puede hacer la diferencia" },
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-light)", border: "1px solid #B8DDC8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                      {b.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#1A3F2F", marginBottom: 2 }}>{b.titulo}</p>
                      <p style={{ fontSize: 11, color: "#4A7C6F" }}>{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #D4EAE0", paddingTop: 20, marginTop: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4A7C6F", marginBottom: 8 }}>Servicios en {condominio.nombre}</p>
                <p style={{ fontSize: 40, fontWeight: 700, color: "var(--accent)", fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>{serviciosCount}</p>
                <p style={{ fontSize: 12, color: "#4A7C6F", marginTop: 4 }}>servicios verificados por vecinos</p>
              </div>

              <div style={{ background: "var(--accent-light)", border: "1px solid #B8DDC8", borderRadius: 10, padding: "14px 16px", marginTop: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#1A3F2F", marginBottom: 4 }}>¿Ya usaste 1dato?</p>
                <p style={{ fontSize: 11, color: "#4A7C6F", lineHeight: 1.6 }}>Pronto podrás dejar tu opinión sobre los servicios del directorio.</p>
              </div>
            </div>
          </div>}

          {/* Columna derecha — formulario */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: isMobile ? "20px 16px" : "32px", boxShadow: "var(--shadow)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 4 }}>{condominio.nombre}</p>
            <h2 className="serif" style={{ fontSize: 24, marginBottom: 4 }}>Sugerir un servicio</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>La información será revisada antes de publicarse.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label style={labelStyle}>Nombre o empresa *</label><input style={inputStyle} value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Ej: Carlos Muñoz / Limpieza Total SpA" /></div>
              {/* Fix 7: Grupo + Categoría en línea */}
              <div>
                <label style={labelStyle}>Categoría *</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <select style={{ ...inputStyle, flex: 1, appearance: "none" }} value={form.grupo}
                    onChange={e => { set("grupo", e.target.value); set("categoria", ""); }}>
                    <option value="">Grupo...</option>
                    {gruposConCats.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                  <select style={{ ...inputStyle, flex: 1, appearance: "none" }} value={form.categoria}
                    onChange={e => set("categoria", e.target.value)} disabled={!form.grupo}>
                    <option value="">Categoría...</option>
                    {catsDelGrupo.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              {/* Fix 2: +56 fijo + campo texto con validación */}
              <div>
                <label style={labelStyle}>Teléfono / WhatsApp *</label>
                <div style={{ display: "flex", gap: 0 }}>
                  <span style={{
                    display: "flex", alignItems: "center", padding: "10px 12px",
                    background: "var(--bg)", border: "1.5px solid var(--border)", borderRight: "none",
                    borderRadius: "10px 0 0 10px", fontSize: 14, color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap",
                  }}>+56</span>
                  <input
                    style={{ ...inputStyle, borderRadius: "0 10px 10px 0", borderColor: telError ? "var(--warn)" : "var(--border)", flex: 1 }}
                    value={form.telefonoLocal}
                    onChange={e => handleTelChange(e.target.value)}
                    placeholder="9 1234 5678"
                    inputMode="numeric"
                  />
                </div>
                {telError && <p style={{ fontSize: 11, color: "var(--warn)", marginTop: 5 }}>⚠ {telError}</p>}
                {!telError && form.telefonoLocal && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>Se guardará como: <strong>{telefonoCompleto}</strong></p>}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Descripción breve</label>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{form.descripcion.length} / 200</span>
                </div>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                  value={form.descripcion}
                  onChange={e => set("descripcion", e.target.value.slice(0, 200))}
                  placeholder="¿Qué hace? ¿Algo que destacar?" />
              </div>
              <div>
                <label style={labelStyle}>¿Lo recomiendas?</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => set("recomienda", v)} style={{ flex: 1, padding: 10, border: `2px solid ${form.recomienda === v ? (v ? "var(--accent)" : "var(--warn)") : "var(--border)"}`, background: form.recomienda === v ? (v ? "var(--accent-light)" : "var(--warn-light)") : "var(--surface)", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: form.recomienda === v ? (v ? "var(--accent)" : "var(--warn)") : "var(--text-muted)" }}>{v ? "👍 Sí" : "👎 No"}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleEnviar} disabled={!valido || enviando} style={{ marginTop: 4, background: (!valido || enviando) ? "var(--border)" : "var(--accent)", color: (!valido || enviando) ? "var(--text-muted)" : "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 600, cursor: (!valido || enviando) ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {enviando ? "⟳ Enviando..." : "Enviar sugerencia"}
              </button>
              {unicidadError && <p style={{ fontSize: 12, color: "var(--warn)", background: "var(--warn-light)", padding: "8px 12px", borderRadius: 8 }}>⚠ {unicidadError}</p>}
              <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, borderTop: "1px solid var(--border)", paddingTop: 12, textAlign: "center" }}>
                🔒 Los datos serán publicados una vez validados. Para eliminar tu información escribe a <strong>{ADMIN_EMAIL}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// ── Login Admin ───────────────────────────────────────────────────
const LoginAdmin = ({ onLogin }) => {
  const [vista, setVista] = useState("login"); // login | reset | confirmado
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Completa todos los campos."); return; }
    setCargando(true); setError("");
    const data = await authLogin(email, password);
    if (data.access_token) { onLogin(data.access_token); }
    else { setError("Email o contraseña incorrectos."); }
    setCargando(false);
  };

  const handleReset = async () => {
    if (!email) { setError("Ingresa tu email primero."); return; }
    setCargando(true); setError("");
    const ok = await authResetPassword(email);
    setCargando(false);
    if (ok) { setVista("confirmado"); }
    else { setError("No se pudo enviar el correo. Verifica el email."); }
  };

  const logoSection = (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
        <IconoChat size={32} fill="#2D6A4F" />
        <span style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#2D6A4F", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.5px" }}>1</span>
          <span style={{ fontSize: 22, fontWeight: 300, color: "#1C1A16", fontFamily: "'DM Sans', sans-serif" }}>dato</span>
        </span>
      </div>
      <h2 className="serif" style={{ fontSize: 24 }}>Panel Administrador</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>Acceso restringido</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }} className="fade-up">
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "36px 32px", boxShadow: "var(--shadow)" }}>

          {/* Vista: login */}
          {vista === "login" && (<>
            {logoSection}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="admin@ejemplo.com" onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
              <div>
                <label style={labelStyle}>Contraseña</label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...inputStyle, paddingRight: 44 }}
                    type={verPassword ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    placeholder="••••••••"
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                  />
                  <button onClick={() => setVerPassword(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", padding: 2 }}>
                    {verPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                  </button>
                </div>
              </div>
              {error && <p style={{ fontSize: 13, color: "var(--warn)", background: "var(--warn-light)", padding: "8px 12px", borderRadius: 8 }}>⚠ {error}</p>}
              <button onClick={handleLogin} disabled={cargando} style={{ marginTop: 4, background: cargando ? "var(--border)" : "#2D6A4F", color: cargando ? "var(--text-muted)" : "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 600, cursor: cargando ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {cargando ? "⟳ Verificando..." : "Ingresar"}
              </button>
              <button onClick={() => { setVista("reset"); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 13, textDecoration: "underline", padding: 0, textAlign: "center" }}>
                Olvidé mi contraseña
              </button>
            </div>
          </>)}

          {/* Vista: reset */}
          {vista === "reset" && (<>
            {logoSection}
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20, textAlign: "center" }}>
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="admin@ejemplo.com" onKeyDown={e => e.key === "Enter" && handleReset()} /></div>
              {error && <p style={{ fontSize: 13, color: "var(--warn)", background: "var(--warn-light)", padding: "8px 12px", borderRadius: 8 }}>⚠ {error}</p>}
              <button onClick={handleReset} disabled={cargando} style={{ background: cargando ? "var(--border)" : "#2D6A4F", color: cargando ? "var(--text-muted)" : "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 600, cursor: cargando ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {cargando ? "⟳ Enviando..." : "Enviar enlace"}
              </button>
              <button onClick={() => { setVista("login"); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 13, textDecoration: "underline", padding: 0, textAlign: "center" }}>
                ← Volver al login
              </button>
            </div>
          </>)}

          {/* Vista: confirmado */}
          {vista === "confirmado" && (
            <div style={{ textAlign: "center" }}>
              {logoSection}
              <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Revisa tu correo</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
                Te enviamos un enlace a <strong>{email}</strong> para restablecer tu contraseña.
              </p>
              <button onClick={() => { setVista("login"); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 13, textDecoration: "underline", padding: 0 }}>
                ← Volver al login
              </button>
            </div>
          )}

        </div>
      </div>
      <p style={{ marginTop: 24, fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
        Copyright © 2026 <strong style={{ color: "var(--text)" }}>1dato</strong> | Todos los derechos reservados
      </p>
    </div>
  );
};

// ── Carga Masiva Excel ────────────────────────────────────────────
const CargaMasiva = ({ condominios, todasCats }) => {
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [preview, setPreview] = useState([]);
  const [errores, setErrores] = useState([]);
  const fileRef = useRef();

  const slugsValidos = condominios.map(c => c.slug);
  const idsValidos = todasCats.map(c => c.id);

  const descargarPlantilla = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["condominio", "nombre", "categoria", "telefono", "descripcion", "recomienda"],
      ["terrazas-chicureo", "Ejemplo Plomero", "gasfiter", "+56 9 1234 5678", "Especialista en cañerías", "si"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Servicios");
    XLSX.writeFile(wb, "plantilla_servicios.xlsx");
  };

  const handleArchivo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
    const errs = [], validas = [];
    rows.forEach((row, i) => {
      const n = i + 2;
      const r = { condominio: String(row.condominio || "").trim(), nombre: String(row.nombre || "").trim(), categoria: String(row.categoria || "").trim(), telefono: String(row.telefono || "").trim(), descripcion: String(row.descripcion || "").trim(), recomienda: ["si", "sí", "yes", "true", "1"].includes(String(row.recomienda || "").toLowerCase()) };
      if (!r.condominio) errs.push(`Fila ${n}: falta condominio`);
      else if (!slugsValidos.includes(r.condominio)) errs.push(`Fila ${n}: condominio "${r.condominio}" no existe`);
      if (!r.nombre) errs.push(`Fila ${n}: falta nombre`);
      if (!r.categoria) errs.push(`Fila ${n}: falta categoría`);
      else if (!idsValidos.includes(r.categoria)) errs.push(`Fila ${n}: categoría "${r.categoria}" no existe`);
      if (!r.telefono) errs.push(`Fila ${n}: falta teléfono`);
      if (!errs.find(e => e.startsWith(`Fila ${n}`))) validas.push(r);
    });
    setErrores(errs); setPreview(validas); setResultado(null);
  };

  const handleImportar = async () => {
    if (!preview.length) return;
    setCargando(true);
    await query("proveedores", { insert: preview.map(r => ({ ...r, estado: "aprobado" })) });
    setResultado({ ok: preview.length }); setPreview([]); setErrores([]);
    if (fileRef.current) fileRef.current.value = "";
    setCargando(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 24px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>📥 Carga masiva de servicios</h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>Columnas: <code style={{ background: "var(--bg)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>condominio, nombre, categoria, telefono, descripcion, recomienda</code></p>
        <button onClick={descargarPlantilla} style={{ background: "var(--accent-light)", color: "var(--accent)", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>⬇️ Descargar plantilla</button>
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 24px" }}>
        <label style={labelStyle}>Archivo .xlsx</label>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleArchivo} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }} />
      </div>
      {errores.length > 0 && <div style={{ background: "var(--warn-light)", border: "1px solid var(--warn)", borderRadius: "var(--radius)", padding: "16px 20px" }}><p style={{ fontSize: 13, fontWeight: 600, color: "var(--warn)", marginBottom: 8 }}>⚠ {errores.length} error{errores.length > 1 ? "es" : ""}:</p><ul style={{ paddingLeft: 18 }}>{errores.map((e, i) => <li key={i} style={{ fontSize: 12, color: "var(--warn)", marginBottom: 3 }}>{e}</li>)}</ul></div>}
      {preview.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 24px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>✅ {preview.length} filas válidas:</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: "var(--bg)" }}>{["Condominio","Nombre","Categoría","Teléfono","Descripción","Rec."].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>{h}</th>)}</tr></thead>
              <tbody>{preview.map((r, i) => <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "8px 12px" }}>{r.condominio}</td><td style={{ padding: "8px 12px" }}>{r.nombre}</td><td style={{ padding: "8px 12px" }}>{r.categoria}</td><td style={{ padding: "8px 12px" }}>{r.telefono}</td><td style={{ padding: "8px 12px", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.descripcion}</td><td style={{ padding: "8px 12px" }}>{r.recomienda ? "👍" : "👎"}</td></tr>)}</tbody>
            </table>
          </div>
          <button onClick={handleImportar} disabled={cargando} style={{ marginTop: 16, background: cargando ? "var(--border)" : "var(--accent)", color: cargando ? "var(--text-muted)" : "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: cargando ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {cargando ? "⟳ Importando..." : `Importar ${preview.length} servicios`}
          </button>
        </div>
      )}
      {resultado && <div style={{ background: "var(--accent-light)", border: "1px solid var(--accent)", borderRadius: "var(--radius)", padding: "16px 20px" }}><p style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>✅ {resultado.ok} servicios importados.</p></div>}
    </div>
  );
};

// ── Sección Servicios Admin ───────────────────────────────────────
const SeccionServicios = ({ servicios, pendientes, aprobados, todasCats, cargando, onAprobar, onConfirmar, onEditar }) => {
  const [tabActiva, setTabActiva] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [promediosVal, setPromediosVal] = useState({}); // { proveedor_id: { promedio, total } }

  useEffect(() => {
    const cargarPromedios = async () => {
      if (!servicios.length) return;
      const ids = servicios.map(s => s.id).join(",");
      const data = await query("valoraciones", { filter: `proveedor_id=in.(${ids})`, select: "proveedor_id,estrellas" });
      if (!Array.isArray(data)) return;
      const acc = {};
      data.forEach(v => {
        if (!acc[v.proveedor_id]) acc[v.proveedor_id] = { suma: 0, total: 0 };
        acc[v.proveedor_id].suma += v.estrellas;
        acc[v.proveedor_id].total += 1;
      });
      const result = {};
      Object.entries(acc).forEach(([id, { suma, total }]) => {
        result[id] = { promedio: (suma / total).toFixed(1), total };
      });
      setPromediosVal(result);
    };
    cargarPromedios();
  }, [servicios]);

  const rechazados = servicios.filter(p => p.estado === "rechazado");
  const porTab = { todos: servicios, pendientes, aprobados, rechazados };

  const filtrados = (porTab[tabActiva] || []).filter(p => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return p.nombre.toLowerCase().includes(q) ||
      todasCats.find(c => c.id === p.categoria)?.label.toLowerCase().includes(q);
  });

  const tabs = [
    { id: "todos", label: "Todos", count: servicios.length },
    { id: "pendientes", label: "Pendientes", count: pendientes.length },
    { id: "aprobados", label: "Aprobados", count: aprobados.length },
    { id: "rechazados", label: "Rechazados", count: rechazados.length },
  ];

  const FilaServicioAdmin = ({ p }) => {
    const esPendiente = p.estado === "pendiente";
    const val = promediosVal[p.id];
    return (
      <div style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{p.nombre}</span>
            <Badge categoriaId={p.categoria} todasCats={todasCats} />
            <span style={{ fontSize: 12, color: p.recomienda ? "#2D6A4F" : "#C0392B", fontWeight: 600 }}>{p.recomienda ? "👍" : "👎"}</span>
            {val ? (
              <span style={{ fontSize: 11, color: "#B5860D", background: "#FDF3DC", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>
                ★ {val.promedio}/7 · {val.total} voto{val.total !== 1 ? "s" : ""}
              </span>
            ) : (
              <span style={{ fontSize: 11, color: "#AAA5A0", background: "#F5F2EE", padding: "2px 8px", borderRadius: 999 }}>Sin valorar</span>
            )}
            {p.estado === "rechazado" && <span style={{ fontSize: 11, background: "#FDECEA", color: "#C0392B", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>Rechazado</span>}
          </div>
          <p style={{ fontSize: 12, color: "#7A7570" }}>📞 {p.telefono}</p>
          {p.descripcion && <p style={{ fontSize: 12, marginTop: 4, color: "#4A4540" }}>{p.descripcion}</p>}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {esPendiente && <button onClick={() => onAprobar(p.id)} style={{ background: "#D8EFE4", color: "#2D6A4F", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>✓ Aprobar</button>}
          <button onClick={() => onEditar({ ...p })} style={{ background: "#FDF3DC", color: "#8B6914", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>✏️ Editar</button>
          <button onClick={() => onConfirmar({ tipo: esPendiente ? "rechazar" : "eliminar", id: p.id, nombre: p.nombre })} style={{ background: "#FDECEA", color: "#C0392B", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {esPendiente ? "✕ Rechazar" : "🗑 Eliminar"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-up">
      <h1 className="serif" style={{ fontSize: 26, color: "#1A3F2F", marginBottom: 16 }}>Servicios</h1>

      {/* Pestañas */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid #E2DDD4" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTabActiva(t.id)} style={{
            background: "none", border: "none", borderBottom: `2px solid ${tabActiva === t.id ? "#2D6A4F" : "transparent"}`,
            padding: "8px 14px", fontSize: 13, fontWeight: tabActiva === t.id ? 600 : 400,
            color: tabActiva === t.id ? "#2D6A4F" : "#7A7570", cursor: "pointer",
            fontFamily: "inherit", marginBottom: -1, display: "flex", alignItems: "center", gap: 6,
          }}>
            {t.label}
            {t.count > 0 && (
              <span style={{ background: tabActiva === t.id ? "#D8EFE4" : "#F0EDE8", color: tabActiva === t.id ? "#2D6A4F" : "#7A7570", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Búsqueda */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={15} color="#7A7570" strokeWidth={2} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o categoría..."
          style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #E2DDD4", borderRadius: 10, fontSize: 13, background: "white", color: "#1C1A16", outline: "none", fontFamily: "inherit" }}
        />
        {busqueda && (
          <button onClick={() => setBusqueda("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#7A7570", display: "flex" }}>
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {cargando ? <Cargando /> : (
        filtrados.length === 0 ? (
          <p style={{ color: "#7A7570", fontSize: 14, padding: "24px 0" }}>
            {busqueda ? `Sin resultados para "${busqueda}"` : "Sin servicios en esta pestaña."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtrados.map(p => <FilaServicioAdmin key={p.id} p={p} />)}
          </div>
        )
      )}
    </div>
  );
};

// ── Panel Admin ───────────────────────────────────────────────────
const PanelAdmin = ({ condominios, onActualizarCondominio, onLogout, adminToken }) => {
  const [condominioActivo, setCondominioActivo] = useState(condominios[0]?.slug || "");
  const [seccion, setSeccion] = useState("condominios");
  const [nuevoCondominio, setNuevoCondominio] = useState(null); // null | "form"
  const [formCond, setFormCond] = useState({ nombre: "", comuna: "", paleta: 0 });
  const [guardandoCond, setGuardandoCond] = useState(false);
  const [resumenCondominios, setResumenCondominios] = useState({});
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [guardado, setGuardado] = useState(false);
  const [nuevaCat, setNuevaCat] = useState({ label: "", emoji: "🏠", grupo: "hogar" });
  const [catError, setCatError] = useState("");
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  const [editandoServicio, setEditandoServicio] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [confirmando, setConfirmando] = useState(null); // { tipo, id, nombre }
  const isMobile = useIsMobile();
  const [valsDashboard, setValsDashboard] = useState({}); // { proveedor_id: { promedio, total } }
  // Grupos y categorías por condominio
  const [grupos, setGrupos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [gruposAbiertos, setGruposAbiertos] = useState({});
  const [nuevoGrupo, setNuevoGrupo] = useState({ label: "", icono: "package" });
  const [grupoError, setGrupoError] = useState("");
  const [renombrandoGrupo, setRenombrandoGrupo] = useState(null); // { id, label }

  const cond = condominios.find(c => c.slug === condominioActivo);

  useEffect(() => { if (cond) setEditando({ ...cond, colores: { ...cond.colores } }); }, [condominioActivo, condominios]);

  useEffect(() => {
    const cargarGruposYCats = async () => {
      if (!condominioActivo) return;
      const [gs, cs] = await Promise.all([
        query("grupos", { filter: `condominio_slug=eq.${condominioActivo}&order=orden.asc` }),
        query("categorias", { filter: `condominio_slug=eq.${condominioActivo}` }),
      ]);
      setGrupos(Array.isArray(gs) ? gs : []);
      setCategorias(Array.isArray(cs) ? cs : []);
      setGruposAbiertos({});
    };
    cargarGruposYCats();
  }, [condominioActivo]);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const [svcs, evs] = await Promise.all([
        query("proveedores", { filter: `condominio=eq.${condominioActivo}&order=id.desc` }),
        fetch(`${SUPABASE_URL}/rest/v1/eventos?select=*&condominio=eq.${condominioActivo}`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${adminToken}` }
        }).then(r => r.json()),
      ]);
      setServicios(Array.isArray(svcs) ? svcs : []);
      setEventos(Array.isArray(evs) ? evs : []);
      // Cargar valoraciones para el dashboard
      if (Array.isArray(svcs) && svcs.length) {
        const ids = svcs.map(s => s.id).join(",");
        const vals = await query("valoraciones", { filter: `proveedor_id=in.(${ids})`, select: "proveedor_id,estrellas" });
        if (Array.isArray(vals)) {
          const acc = {};
          vals.forEach(v => {
            if (!acc[v.proveedor_id]) acc[v.proveedor_id] = { suma: 0, total: 0 };
            acc[v.proveedor_id].suma += v.estrellas;
            acc[v.proveedor_id].total += 1;
          });
          const result = {};
          Object.entries(acc).forEach(([id, { suma, total }]) => {
            result[id] = { promedio: parseFloat((suma / total).toFixed(1)), total };
          });
          setValsDashboard(result);
        }
      }
      setCargando(false);
    };
    if (condominioActivo) cargar();
  }, [condominioActivo]);

  const handleAprobar = async (id) => { await query("proveedores", { update: { where: `id=eq.${id}`, data: { estado: "aprobado" } } }); setServicios(p => p.map(x => x.id === id ? { ...x, estado: "aprobado" } : x)); };
  const handleRechazar = async (id) => { await query("proveedores", { remove: `id=eq.${id}` }); setServicios(p => p.filter(x => x.id !== id)); setConfirmando(null); };
  const handleEditar = async (id, datos) => { await query("proveedores", { update: { where: `id=eq.${id}`, data: datos } }); setServicios(p => p.map(x => x.id === id ? { ...x, ...datos } : x)); setEditandoServicio(null); };
  const handleGuardarCondominio = async () => { await query("condominios", { update: { where: `slug=eq.${condominioActivo}`, data: { nombre: editando.nombre, comuna: editando.comuna || "", colores: editando.colores } } }); onActualizarCondominio(editando); setGuardado(true); setTimeout(() => setGuardado(false), 2000); };

  // ── Handlers grupos ───────────────────────────────────────────────
  const handleAgregarGrupo = async () => {
    const label = nuevoGrupo.label.trim();
    if (!label) { setGrupoError("Escribe un nombre."); return; }
    if (grupos.find(g => g.label.toLowerCase() === label.toLowerCase())) { setGrupoError("Ya existe."); return; }
    const orden = grupos.length ? Math.max(...grupos.map(g => g.orden)) + 1 : 1;
    const res = await query("grupos", { insert: { condominio_slug: condominioActivo, label, icono: nuevoGrupo.icono, orden } });
    if (Array.isArray(res) && res[0]) setGrupos(prev => [...prev, res[0]]);
    setNuevoGrupo({ label: "", icono: "package" }); setGrupoError("");
  };
  const handleRenombrarGrupo = async () => {
    if (!renombrandoGrupo?.label.trim()) return;
    await query("grupos", { update: { where: `id=eq.${renombrandoGrupo.id}`, data: { label: renombrandoGrupo.label.trim() } } });
    setGrupos(prev => prev.map(g => g.id === renombrandoGrupo.id ? { ...g, label: renombrandoGrupo.label.trim() } : g));
    setRenombrandoGrupo(null);
  };
  const handleEliminarGrupo = async (id) => {
    const tieneCats = categorias.some(c => c.grupo_id === id);
    if (tieneCats) return;
    await query("grupos", { remove: `id=eq.${id}` });
    setGrupos(prev => prev.filter(g => g.id !== id));
    setConfirmando(null);
  };

  // ── Handlers categorías ───────────────────────────────────────────
  const handleToggleCategoria = async (catId, activa) => {
    await query("categorias", { update: { where: `id=eq.${catId}`, data: { activa: !activa } } });
    setCategorias(prev => prev.map(c => c.id === catId ? { ...c, activa: !activa } : c));
  };
  const handleAgregarCategoria = async () => {
    const label = nuevaCat.label.trim();
    if (!label) { setCatError("Escribe un nombre."); return; }
    const id = `${condominioActivo}_${label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")}`;
    if (categorias.find(c => c.id === id)) { setCatError("Ya existe."); return; }
    const grupoId = nuevaCat.grupo || null;
    const res = await query("categorias", { insert: { id, condominio_slug: condominioActivo, label, emoji: nuevaCat.emoji, grupo_id: grupoId, activa: true, custom: true } });
    if (Array.isArray(res) && res[0]) setCategorias(prev => [...prev, res[0]]);
    setNuevaCat({ label: "", emoji: "🏠", grupo: grupos[0]?.id || null }); setCatError(""); setMostrarEmojis(false);
  };
  const handleEliminarCategoria = async (id) => {
    await query("categorias", { remove: `id=eq.${id}` });
    setCategorias(prev => prev.filter(c => c.id !== id));
    setConfirmando(null);
  };

  // Cargar resumen de servicios por condominio (para vista Condominios)
  useEffect(() => {
    const cargarResumen = async () => {
      const todos = await query("proveedores", { select: "condominio,estado" });
      if (!Array.isArray(todos)) return;
      const res = {};
      todos.forEach(p => {
        if (!res[p.condominio]) res[p.condominio] = { aprobados: 0, pendientes: 0 };
        if (p.estado === "aprobado") res[p.condominio].aprobados++;
        if (p.estado === "pendiente") res[p.condominio].pendientes++;
      });
      setResumenCondominios(res);
    };
    cargarResumen();
  }, [condominios]);

  const handleCrearCondominio = async () => {
    if (!formCond.nombre.trim()) return;
    setGuardandoCond(true);
    const slug = formCond.nombre.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const paleta = PALETAS[formCond.paleta];
    const nuevoCond = {
      slug,
      nombre: formCond.nombre.trim(),
      comuna: formCond.comuna.trim(),
      colores: { accent: paleta.accent, accentLight: paleta.accentLight, bg: paleta.bg, surface: paleta.surface, border: paleta.border },
      categorias_activas: TODAS_CATEGORIAS.map(c => c.id),
    };
    await query("condominios", { insert: nuevoCond });
    onActualizarCondominio(nuevoCond);
    // Recargar condominios
    const conds = await query("condominios");
    if (Array.isArray(conds)) conds.forEach(c => onActualizarCondominio(c));
    setNuevoCondominio(null);
    setFormCond({ nombre: "", comuna: "", paleta: 0 });
    setGuardandoCond(false);
    setCondominioActivo(slug);
    setSeccion("dashboard");
  };

  // ── Derivados de servicios (deben ir antes de SideLink y período) ──
  const pendientes = servicios.filter(p => p.estado === "pendiente");
  const aprobados = servicios.filter(p => p.estado === "aprobado");
  const catsActivas = categorias.filter(c => c.activa);

  // ── Dashboard período filter ──────────────────────────────────
  const [periodo, setPeriodo] = useState("7d");
  const msMap = { hoy: 1, "7d": 7, mes: 30 };
  const diasPeriodo = msMap[periodo] || 7;
  const hacePeriodo = new Date(Date.now() - diasPeriodo * 24 * 60 * 60 * 1000).toISOString();
  const haceDosPeriodos = new Date(Date.now() - diasPeriodo * 2 * 24 * 60 * 60 * 1000).toISOString();

  const eventosDelPeriodo = eventos.filter(e => new Date(e.created_at) >= new Date(hacePeriodo));
  const eventosPeriodoAnterior = eventos.filter(e => new Date(e.created_at) >= new Date(haceDosPeriodos) && new Date(e.created_at) < new Date(hacePeriodo));

  const vistasPeriodo = eventosDelPeriodo.filter(e => e.tipo === "vista");
  const contactosPeriodo = eventosDelPeriodo.filter(e => e.tipo === "contacto");
  const vistasAnt = eventosPeriodoAnterior.filter(e => e.tipo === "vista");
  const contactosAnt = eventosPeriodoAnterior.filter(e => e.tipo === "contacto");

  const calcVar = (actual, anterior) => {
    if (anterior === 0) return actual > 0 ? "+100%" : null;
    const diff = Math.round(((actual - anterior) / anterior) * 100);
    return (diff >= 0 ? "+" : "") + diff + "%";
  };
  const varVistas = calcVar(vistasPeriodo.length, vistasAnt.length);
  const varContactos = calcVar(contactosPeriodo.length, contactosAnt.length);
  const tasaContactoPeriodo = vistasPeriodo.length > 0 ? Math.round((contactosPeriodo.length / vistasPeriodo.length) * 100) : 0;
  const tasaAnt = vistasAnt.length > 0 ? Math.round((contactosAnt.length / vistasAnt.length) * 100) : 0;
  const varTasa = calcVar(tasaContactoPeriodo, tasaAnt);

  // Actividad diaria usando el período seleccionado
  const toLocalDate = (isoStr) => {
    const d = new Date(isoStr);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };
  const diasLabel = Array.from({ length: Math.min(diasPeriodo, 7) }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (Math.min(diasPeriodo, 7) - 1 - i));
    return toLocalDate(d.toISOString());
  });
  const actividadDiaria = diasLabel.map(dia => ({
    dia: dia.slice(5),
    vistas: eventos.filter(e => e.tipo === "vista" && toLocalDate(e.created_at) === dia).length,
    contactos: eventos.filter(e => e.tipo === "contacto" && toLocalDate(e.created_at) === dia).length,
  }));
  const maxActividad = Math.max(...actividadDiaria.map(d => d.vistas + d.contactos), 1);

  // Helper: nombre con categoría
  const nombreConCat = (svc) => {
    if (!svc) return "—";
    const cat = categorias.find(c => c.id === svc.categoria);
    return cat ? `${svc.nombre} (${cat.label})` : svc.nombre;
  };

  const exportarReporte = () => {
    const wb = XLSX.utils.book_new();
    const svcsData = [
      ["Nombre", "Categoría", "Teléfono", "Descripción", "Recomienda", "Estado"],
      ...aprobados.map(s => [s.nombre, categorias.find(c => c.id === s.categoria)?.label || s.categoria, s.telefono, s.descripcion || "", s.recomienda ? "Sí" : "No", s.estado]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(svcsData), "Servicios");
    const evData = [
      ["Proveedor", "Categoría", "Tipo", "Fecha"],
      ...eventosDelPeriodo.map(e => {
        const svc = servicios.find(s => s.id === e.proveedor_id);
        return [svc?.nombre || e.proveedor_id, categorias.find(c => c.id === svc?.categoria)?.label || "", e.tipo, e.created_at?.slice(0, 10)];
      }),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(evData), "Actividad");
    // Hoja 3: Resumen
    const resData = [
      ["Métrica", "Valor"],
      ["Condominio", cond?.nombre],
      ["Período", periodo === "hoy" ? "Hoy" : periodo === "7d" ? "Últimos 7 días" : "Último mes"],
      ["Servicios aprobados", aprobados.length],
      ["Servicios pendientes", pendientes.length],
      ["Vistas en el período", vistasPeriodo.length],
      ["Contactos en el período", contactosPeriodo.length],
      ["Conversión de consultas", `${tasaContactoPeriodo}%`],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resData), "Resumen");
    XLSX.writeFile(wb, `reporte_${cond?.slug}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  if (!editando) return <Cargando />;

  // Aviso mobile — panel solo desktop
  if (isMobile) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>🖥️</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A3F2F", marginBottom: 12 }}>Panel solo disponible en escritorio</h2>
      <p style={{ fontSize: 14, color: "#7A7570", lineHeight: 1.7, maxWidth: 320 }}>
        El panel de administración está optimizado para pantallas de computador. Por favor accede desde un desktop o laptop.
      </p>
      <button onClick={onLogout} style={{ marginTop: 32, background: "none", border: "1px solid #E2DDD4", borderRadius: 8, padding: "10px 20px", fontSize: 13, color: "#7A7570", cursor: "pointer", fontFamily: "inherit" }}>
        Cerrar sesión
      </button>
    </div>
  );

  // Ranking histórico por proveedor
  const vistasTotal = eventos.filter(e => e.tipo === "vista");
  const contactosTotal = eventos.filter(e => e.tipo === "contacto");
  const contarPorProveedor = (evs) => { const c = {}; evs.forEach(e => { c[e.proveedor_id] = (c[e.proveedor_id] || 0) + 1; }); return c; };
  const vistasPorProv = contarPorProveedor(vistasTotal);
  const contactosPorProv = contarPorProveedor(contactosTotal);
  const masVisto = Object.entries(vistasPorProv).sort((a, b) => b[1] - a[1])[0];
  const masContactado = Object.entries(contactosPorProv).sort((a, b) => b[1] - a[1])[0];
  const masVistoSvc = masVisto ? servicios.find(s => s.id === parseInt(masVisto[0])) : null;
  const masContactadoSvc = masContactado ? servicios.find(s => s.id === parseInt(masContactado[0])) : null;

  // Top 3 mejor valorados
  const top3Valorados = aprobados
    .filter(s => valsDashboard[s.id])
    .map(s => ({ ...s, promedio: valsDashboard[s.id].promedio, totalVotos: valsDashboard[s.id].total }))
    .sort((a, b) => b.promedio - a.promedio || b.totalVotos - a.totalVotos)
    .slice(0, 3);
  const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const sinVistas = aprobados.filter(s => !vistasPorProv[s.id] && s.updated_at && new Date(s.updated_at) < hace7dias);

  // Servicios por categoría
  const porCategoria = catsActivas.map(cat => ({
    ...cat, total: aprobados.filter(s => s.categoria === cat.id).length,
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 6);
  const maxCat = Math.max(...porCategoria.map(c => c.total), 1);

  const SideLink = ({ id, icon, label, badge }) => (
    <button onClick={() => setSeccion(id)} style={{
      width: "100%", textAlign: "left",
      background: seccion === id ? "#2D6A4F" : "transparent",
      border: "none", borderLeft: `3px solid ${seccion === id ? "#1A3F2F" : "transparent"}`,
      padding: "10px 16px", cursor: "pointer", fontFamily: "inherit",
      display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s",
      color: seccion === id ? "#ffffff" : "#5A7A6A", fontSize: 13, fontWeight: seccion === id ? 600 : 400,
    }}
      onMouseEnter={e => { if (seccion !== id) e.currentTarget.style.background = "#d0eadb"; }}
      onMouseLeave={e => { if (seccion !== id) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && <span style={{ background: seccion === id ? "rgba(255,255,255,0.25)" : "#FDF3DC", color: seccion === id ? "#fff" : "#8B6914", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>{badge}</span>}
    </button>
  );

  const ModalEditarServicio = () => {
    const [form, setForm] = useState({ ...editandoServicio });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const gruposConCats = grupos.map(g => ({ ...g, cats: categorias.filter(c => c.grupo_id === g.id && c.activa) })).filter(g => g.cats.length > 0);
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 24 }} onClick={e => e.target === e.currentTarget && setEditandoServicio(null)}>
        <div className="fade-up" style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 16, padding: "28px", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(28,26,22,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 className="serif" style={{ fontSize: 22, color: "#1A3F2F" }}>Editar servicio</h3>
            <button onClick={() => setEditandoServicio(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#7A7570" }}>✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label style={labelStyle}>Nombre</label><input style={inputStyle} value={form.nombre} onChange={e => set("nombre", e.target.value)} /></div>
            <div><label style={labelStyle}>Categoría</label>
              <select style={{ ...inputStyle, appearance: "none" }} value={form.categoria} onChange={e => set("categoria", e.target.value)}>
                {gruposConCats.map(g => <optgroup key={g.id} label={g.label}>{g.cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</optgroup>)}
              </select>
            </div>
            <div><label style={labelStyle}>Teléfono</label><input style={inputStyle} value={form.telefono} onChange={e => set("telefono", e.target.value)} /></div>
            <div><label style={labelStyle}>Descripción</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} value={form.descripcion || ""} onChange={e => set("descripcion", e.target.value)} /></div>
            <div><label style={labelStyle}>¿Lo recomiendas?</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[true, false].map(v => <button key={String(v)} onClick={() => set("recomienda", v)} style={{ flex: 1, padding: 10, border: `2px solid ${form.recomienda === v ? (v ? "#2D6A4F" : "#C0392B") : "#E2DDD4"}`, background: form.recomienda === v ? (v ? "#D8EFE4" : "#FDECEA") : "white", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: form.recomienda === v ? (v ? "#2D6A4F" : "#C0392B") : "#7A7570" }}>{v ? "👍 Sí" : "👎 No"}</button>)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditandoServicio(null)} style={{ flex: 1, background: "#F5F2EC", border: "1.5px solid #E2DDD4", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#7A7570" }}>Cancelar</button>
              <button onClick={() => handleEditar(form.id, { nombre: form.nombre, categoria: form.categoria, telefono: form.telefono, descripcion: form.descripcion, recomienda: form.recomienda })} style={{ flex: 2, background: "#2D6A4F", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Guardar</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ minHeight: "100vh", background: "#F5F2EC", display: "flex" }}>

        {/* Sidebar */}
        <div style={{ width: 220, flexShrink: 0, background: "#e8f5ee", borderRight: "1px solid #D4EAE0", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
          {/* Logo con padding generoso */}
          <div style={{ padding: "22px 18px 16px", borderBottom: "1px solid #D4EAE0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconoChat size={26} fill="#2D6A4F" />
              <span style={{ fontSize: 17, fontWeight: 700, color: "#2D6A4F", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.5px" }}>1</span>
              <span style={{ fontSize: 17, fontWeight: 300, color: "#1C1A16", fontFamily: "'Inter', sans-serif", marginLeft: -6 }}>dato</span>
            </div>
          </div>

          {/* GENERAL */}
          <div style={{ padding: "12px 0", borderBottom: "1px solid #D4EAE0" }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4A7C6F", padding: "0 16px 6px" }}>General</p>
            <SideLink id="condominios" icon="🏘️" label="Condominios" />
          </div>

          {/* MENÚ */}
          <div style={{ flex: 1, padding: "12px 0" }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4A7C6F", padding: "0 16px 6px" }}>Menú</p>
            <SideLink id="dashboard" icon="📊" label="Dashboard" />
            <SideLink id="servicios" icon="📋" label="Servicios" badge={pendientes.length} />
            <SideLink id="carga_masiva" icon="📥" label="Carga Masiva" />
            <SideLink id="configuracion" icon="⚙️" label="Configuración" />
          </div>

          {/* Logout */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #D4EAE0" }}>
            <button onClick={onLogout} style={{ width: "100%", background: "#FDECEA", color: "#C0392B", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cerrar sesión</button>
            <p style={{ fontSize: 10, color: "#4A7C6F", marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>
              © 2026 <strong>1dato</strong><br />Todos los derechos reservados
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>


          {/* ── CONDOMINIOS ── */}
          {seccion === "condominios" && (
            <div className="fade-up">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                  <h1 className="serif" style={{ fontSize: 26, color: "#1A3F2F", marginBottom: 4 }}>Condominios</h1>
                  <p style={{ fontSize: 13, color: "#7A7570" }}>{condominios.length} condominio{condominios.length !== 1 ? "s" : ""} registrado{condominios.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setNuevoCondominio("form")} style={{
                  background: "#2D6A4F", color: "#fff", border: "none", borderRadius: 10,
                  padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>+</span> Nuevo condominio
                </button>
              </div>

              {/* Tarjetas de condominios */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
                {condominios.map(c => {
                  const res = resumenCondominios[c.slug] || { aprobados: 0, pendientes: 0 };
                  const isActivo = condominioActivo === c.slug;
                  // Vistas del mes para este condominio
                  const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0,0,0,0);
                  const vistasMes = eventos.filter(e => e.tipo === "vista" && e.condominio === c.slug && new Date(e.created_at) >= inicioMes).length;
                  // Categorías activas
                  const numCats = (c.categorias_activas || []).length;
                  return (
                    <div key={c.slug} style={{
                      background: "white", border: `2px solid ${isActivo ? "#2D6A4F" : "#E2DDD4"}`,
                      borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 12px rgba(28,26,22,0.06)",
                      transition: "box-shadow 0.15s, border-color 0.15s", cursor: "pointer",
                    }}
                      onClick={() => { setCondominioActivo(c.slug); setSeccion("dashboard"); }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(28,26,22,0.12)"; if (!isActivo) e.currentTarget.style.borderColor = "#B8DDC8"; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(28,26,22,0.06)"; e.currentTarget.style.borderColor = isActivo ? "#2D6A4F" : "#E2DDD4"; }}
                    >
                      {/* Header: dot + nombre + badge activo */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.colores?.accent || "#2D6A4F", flexShrink: 0 }} />
                        <p style={{ fontWeight: 600, fontSize: 14, color: "#1A3F2F", flex: 1 }}>{c.nombre}</p>
                        {isActivo && <span style={{ fontSize: 10, background: "#D8EFE4", color: "#2D6A4F", padding: "2px 8px", borderRadius: 999, fontWeight: 700, flexShrink: 0 }}>Activo</span>}
                      </div>
                      {/* Info line: comuna · servicios · categorías · vistas · link */}
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, fontSize: 11, color: "#7A7570" }}>
                        {c.comuna && <span>📍 {c.comuna}</span>}
                        {c.comuna && <span style={{ color: "#D4D0CB" }}>·</span>}
                        <span>📋 {res.aprobados + res.pendientes} servicios</span>
                        <span style={{ color: "#D4D0CB" }}>·</span>
                        <span>🏷 {numCats} categorías</span>
                        <span style={{ color: "#D4D0CB" }}>·</span>
                        <span>👁 {vistasMes} vistas este mes</span>
                        <span style={{ color: "#D4D0CB" }}>·</span>
                        <a
                          href={`/${c.slug}`} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ color: "#2D6A4F", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                        >/{c.slug} ↗</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── MODAL NUEVO CONDOMINIO ── */}
          {nuevoCondominio === "form" && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: 24 }}>
              <div className="fade-up" style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(28,26,22,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 className="serif" style={{ fontSize: 22, color: "#1A3F2F" }}>Nuevo condominio</h3>
                  <button onClick={() => setNuevoCondominio(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A7570", fontSize: 18 }}>✕</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 2 }}>
                      <label style={labelStyle}>Nombre *</label>
                      <input style={inputStyle} value={formCond.nombre} onChange={e => setFormCond(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Las Acacias" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Comuna</label>
                      <input style={inputStyle} value={formCond.comuna} onChange={e => setFormCond(f => ({ ...f, comuna: e.target.value }))} placeholder="Ej: Colina" />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Paleta de colores</label>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {PALETAS.map((p, i) => (
                        <button key={p.nombre} onClick={() => setFormCond(f => ({ ...f, paleta: i }))} style={{
                          border: `2px solid ${formCond.paleta === i ? p.accent : "#E2DDD4"}`,
                          borderRadius: 10, padding: "8px 12px", cursor: "pointer", background: formCond.paleta === i ? p.accentLight : "#F5F2EC",
                          display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit",
                        }}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", background: p.accent }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: formCond.paleta === i ? p.accent : "#7A7570" }}>{p.nombre}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {formCond.nombre && (
                    <p style={{ fontSize: 11, color: "#7A7570", background: "#F5F2EC", padding: "8px 12px", borderRadius: 8 }}>
                      URL: <strong>/{formCond.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}</strong>
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button onClick={() => setNuevoCondominio(null)} style={{ flex: 1, background: "#F5F2EC", border: "1.5px solid #E2DDD4", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#7A7570" }}>Cancelar</button>
                    <button onClick={handleCrearCondominio} disabled={!formCond.nombre.trim() || guardandoCond} style={{ flex: 2, background: (!formCond.nombre.trim() || guardandoCond) ? "#E2DDD4" : "#2D6A4F", color: (!formCond.nombre.trim() || guardandoCond) ? "#7A7570" : "#fff", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600, cursor: (!formCond.nombre.trim() || guardandoCond) ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                      {guardandoCond ? "⟳ Creando..." : "Crear condominio"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DASHBOARD ── */}
          {seccion === "dashboard" && (
            <div className="fade-up">
              {/* Header + controles */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h1 className="serif" style={{ fontSize: 26, color: "#1A3F2F", marginBottom: 4 }}>Dashboard</h1>
                  <p style={{ fontSize: 13, color: "#1A3F2F", fontWeight: 500 }}>{cond?.nombre} · {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Filtro período */}
                  <div style={{ display: "flex", background: "white", border: "1.5px solid #E2DDD4", borderRadius: 10, overflow: "hidden" }}>
                    {[["hoy","Hoy"],["7d","7 días"],["mes","Mes"]].map(([val, label]) => (
                      <button key={val} onClick={() => setPeriodo(val)} style={{
                        background: periodo === val ? "#2D6A4F" : "transparent",
                        color: periodo === val ? "#fff" : "#7A7570",
                        border: "none", padding: "7px 14px", fontSize: 12, fontWeight: periodo === val ? 600 : 400,
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      }}>{label}</button>
                    ))}
                  </div>
                  {/* Exportar reporte */}
                  <button onClick={exportarReporte} style={{
                    background: "#2D6A4F", color: "#fff", border: "none", borderRadius: 10,
                    padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
                  }}>
                    📊 Exportar reporte
                  </button>
                </div>
              </div>

              {/* Panel de Control de Servicios */}
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A7570", marginBottom: 10 }}>Panel de Control de Servicios</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Pendientes", val: pendientes.length, bg: "#FDF3DC", color: "#8B6914", border: "#EDE5CC", seccion: "servicios", cta: pendientes.length === 0 ? "Todo al día ✓" : null },
                  { label: "Aprobados", val: aprobados.length, bg: "#D8EFE4", color: "#2D6A4F", border: "#B8DDC8", seccion: "servicios", cta: aprobados.length === 0 ? "Agrega servicios →" : null },
                  { label: "Total", val: servicios.length, bg: "white", color: "#1C1A16", border: "#E2DDD4", seccion: "servicios", cta: null },
                  { label: "Categorías", val: catsActivas.length, bg: "#E8F5EE", color: "#2D6A4F", border: "#C8E8D8", seccion: null, cta: null },
                ].map(s => (
                  <div key={s.label}
                    onClick={() => s.seccion && setSeccion(s.seccion)}
                    style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "16px 18px", cursor: s.seccion ? "pointer" : "default", transition: "box-shadow 0.15s" }}
                    onMouseEnter={e => { if (s.seccion) e.currentTarget.style.boxShadow = "0 4px 16px rgba(28,26,22,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <p style={{ fontSize: 30, fontWeight: 700, color: s.color, fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>{s.val}</p>
                    <p style={{ fontSize: 10, fontWeight: 600, color: s.color, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 6, opacity: 0.8 }}>{s.label}</p>
                    {s.cta && <p style={{ fontSize: 10, color: s.color, marginTop: 4, opacity: 0.7 }}>{s.cta}</p>}
                  </div>
                ))}
              </div>

              {/* Pendientes rápidos */}
              {pendientes.length > 0 && (
                <div style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1A3F2F" }}>⏳ Pendientes de revisión</h3>
                    <button onClick={() => setSeccion("servicios")} style={{ fontSize: 11, color: "#2D6A4F", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>Ver todos</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {pendientes.slice(0, 3).map(p => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F0EDE8" }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600 }}>{nombreConCat(p)}</p>
                          <p style={{ fontSize: 11, color: "#7A7570" }}>{p.telefono}</p>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => handleAprobar(p.id)} style={{ background: "#D8EFE4", color: "#2D6A4F", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>✓ Aprobar</button>
                          <button onClick={() => handleRechazar(p.id)} style={{ background: "#FDECEA", color: "#C0392B", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                {/* Servicios por categoría */}
                <div style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 14, padding: "18px 20px" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1A3F2F", marginBottom: 16 }}>Servicios por categoría</h3>
                  {porCategoria.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "16px 0" }}>
                      {/* Placeholder visual */}
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 50, justifyContent: "center", marginBottom: 10, opacity: 0.2 }}>
                        {[30,50,20,40,35,25].map((h,i) => <div key={i} style={{ width: 18, height: h, background: "#2D6A4F", borderRadius: "3px 3px 0 0" }} />)}
                      </div>
                      <p style={{ fontSize: 12, color: "#7A7570", marginBottom: 8 }}>Sin servicios aprobados aún.</p>
                      <button onClick={() => setSeccion("carga_masiva")} style={{ fontSize: 11, color: "#2D6A4F", background: "#D8EFE4", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Carga masiva →</button>
                    </div>
                  ) : porCategoria.map(cat => (
                    <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: "#4A4540", width: 100, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.label}</span>
                      <div style={{ flex: 1, height: 6, background: "#E8F5EE", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${(cat.total / maxCat) * 100}%`, height: "100%", background: "#2D6A4F", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#2D6A4F", width: 20, textAlign: "right" }}>{cat.total}</span>
                    </div>
                  ))}
                </div>

                {/* Tendencia de Engagement */}
                <div style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 14, padding: "18px 20px" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1A3F2F", marginBottom: 4 }}>Tendencia de Engagement</h3>
                  <p style={{ fontSize: 11, color: "#7A7570", marginBottom: 14 }}>Vistas y contactos · {periodo === "hoy" ? "hoy" : periodo === "7d" ? "últimos 7 días" : "últimos 30 días"}</p>
                  {eventos.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "10px 0" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 50, justifyContent: "center", marginBottom: 10, opacity: 0.15 }}>
                        {[20,35,15,45,30,25,40].map((h,i) => <div key={i} style={{ width: 14, height: h, background: "#2D6A4F", borderRadius: "3px 3px 0 0" }} />)}
                      </div>
                      <p style={{ fontSize: 12, color: "#7A7570", marginBottom: 8 }}>Sin actividad registrada aún.</p>
                      <p style={{ fontSize: 11, color: "#7A7570" }}>Los eventos se registran cuando vecinos visitan o contactan servicios.</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                        {actividadDiaria.map((d, i) => (
                          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, flex: 1, justifyContent: "flex-end" }}>
                              <div style={{ width: "100%", height: `${((d.vistas / maxActividad) * 60) || 2}px`, background: "#2D6A4F", borderRadius: "3px 3px 0 0", minHeight: 2 }} />
                              <div style={{ width: "100%", height: `${((d.contactos / maxActividad) * 60) || 2}px`, background: "#8B6914", borderRadius: "3px 3px 0 0", minHeight: 2 }} />
                            </div>
                            <span style={{ fontSize: 9, color: "#7A7570" }}>{d.dia}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                        <span style={{ fontSize: 10, color: "#2D6A4F", display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, background: "#2D6A4F", borderRadius: 2, display: "inline-block" }} /> Vistas</span>
                        <span style={{ fontSize: 10, color: "#8B6914", display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, background: "#8B6914", borderRadius: 2, display: "inline-block" }} /> Contactos</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Conversión + Rankings */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                {/* Conversión de Consultas */}
                <div style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 14, padding: "16px 18px" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7A7570", marginBottom: 8 }}>Conversión de Consultas</p>
                  {eventosDelPeriodo.length === 0 ? (
                    <p style={{ fontSize: 12, color: "#7A7570", marginTop: 8 }}>Sin datos en este período</p>
                  ) : (
                    <>
                      <p style={{ fontSize: 32, fontWeight: 700, color: "#2D6A4F", fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>{tasaContactoPeriodo}%</p>
                      {varTasa && <p style={{ fontSize: 11, color: varTasa.startsWith("+") ? "#2D6A4F" : "#C0392B", marginTop: 4, fontWeight: 600 }}>{varTasa} vs período anterior</p>}
                      <p style={{ fontSize: 11, color: "#7A7570", marginTop: 2 }}>vistas que se convierten en contacto</p>
                    </>
                  )}
                </div>
                {/* Ranking de Visibilidad */}
                <div style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 14, padding: "16px 18px" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7A7570", marginBottom: 8 }}>Más Visitado</p>
                  {masVistoSvc ? (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1A3F2F", lineHeight: 1.3 }}>{nombreConCat(masVistoSvc)}</p>
                      <p style={{ fontSize: 11, color: "#7A7570", marginTop: 4 }}>{masVisto[1]} vista{masVisto[1] !== 1 ? "s" : ""} · histórico</p>
                    </>
                  ) : (
                    <div>
                      <p style={{ fontSize: 12, color: "#7A7570", marginBottom: 6 }}>Sin datos aún</p>
                      <p style={{ fontSize: 11, color: "#7A7570" }}>Aparecerá cuando los vecinos visiten servicios</p>
                    </div>
                  )}
                </div>
                {/* Más contactado */}
                <div style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 14, padding: "16px 18px" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7A7570", marginBottom: 8 }}>Más Contactado</p>
                  {masContactadoSvc ? (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1A3F2F", lineHeight: 1.3 }}>{nombreConCat(masContactadoSvc)}</p>
                      <p style={{ fontSize: 11, color: "#7A7570", marginTop: 4 }}>{masContactado[1]} contacto{masContactado[1] !== 1 ? "s" : ""} · histórico</p>
                    </>
                  ) : (
                    <div>
                      <p style={{ fontSize: 12, color: "#7A7570", marginBottom: 6 }}>Sin datos aún</p>
                      <p style={{ fontSize: 11, color: "#7A7570" }}>Aparecerá cuando vecinos llamen o escriban</p>
                    </div>
                  )}
                </div>
                {/* Top 3 Mejor Valorados */}
                <div style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 14, padding: "16px 18px" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7A7570", marginBottom: 8 }}>Mejor Valorados</p>
                  {top3Valorados.length === 0 ? (
                    <div>
                      <p style={{ fontSize: 12, color: "#7A7570", marginBottom: 6 }}>Sin valoraciones aún</p>
                      <p style={{ fontSize: 11, color: "#7A7570" }}>Aparecerá cuando los vecinos valoren servicios</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {top3Valorados.map((s, i) => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? "#B5860D" : i === 1 ? "#7A7570" : "#A0855B", minWidth: 16 }}>
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "#1A3F2F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.nombre}</p>
                            <p style={{ fontSize: 11, color: "#B5860D" }}>★ {s.promedio}/7 · {s.totalVotos} voto{s.totalVotos !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Oportunidades de Mejora (antes: "sin vistas") */}
              {sinVistas.length > 0 && (
                <div style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1A3F2F" }}>💡 Oportunidades de Mejora</h3>
                    <span style={{ fontSize: 11, color: "#8B6914", background: "#FDF3DC", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>{sinVistas.length} sin vistas</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#7A7570", marginBottom: 10 }}>Estos servicios aún no han recibido visitas. Considera revisar su categoría o descripción.</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {sinVistas.slice(0, 6).map(s => (
                      <span key={s.id} style={{ fontSize: 11, background: "#FDF3DC", color: "#8B6914", padding: "3px 10px", borderRadius: 999, fontWeight: 500 }}>
                        {nombreConCat(s)}
                      </span>
                    ))}
                    {sinVistas.length > 6 && <span style={{ fontSize: 11, color: "#7A7570" }}>+{sinVistas.length - 6} más</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SERVICIOS ── */}
          {seccion === "servicios" && (
            <SeccionServicios
              servicios={servicios}
              pendientes={pendientes}
              aprobados={aprobados}
              todasCats={categorias}
              cargando={cargando}
              onAprobar={handleAprobar}
              onConfirmar={setConfirmando}
              onEditar={setEditandoServicio}
            />
          )}

          {/* ── CARGA MASIVA ── */}
          {seccion === "carga_masiva" && (
            <div className="fade-up">
              <h1 className="serif" style={{ fontSize: 26, color: "#1A3F2F", marginBottom: 20 }}>Carga Masiva</h1>
              <CargaMasiva condominios={condominios} todasCats={categorias} />
            </div>
          )}

          {/* ── CONFIGURACIÓN ── */}
          {seccion === "configuracion" && editando && (
            <div className="fade-up">
              <h1 className="serif" style={{ fontSize: 26, color: "#1A3F2F", marginBottom: 20 }}>Configuración</h1>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 14, padding: "20px 24px" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1A3F2F", marginBottom: 12 }}>🏠 Información del condominio</h3>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 2 }}>
                      <label style={{ ...labelStyle, color: "#7A7570" }}>Nombre</label>
                      <input style={inputStyle} value={editando.nombre} onChange={e => setEditando(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Terrazas de Chicureo" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...labelStyle, color: "#7A7570" }}>Comuna</label>
                      <input style={inputStyle} value={editando.comuna || ""} onChange={e => setEditando(p => ({ ...p, comuna: e.target.value }))} placeholder="Ej: Colina" />
                    </div>
                  </div>
                </div>
                <div style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 14, padding: "20px 24px" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1A3F2F", marginBottom: 4 }}>🎨 Paleta de colores</h3>
                  <p style={{ fontSize: 12, color: "#7A7570", marginBottom: 16 }}>El color se aplica en toda la vista pública incluyendo el hero.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
                    {PALETAS.map(p => { const sel = editando.colores.accent === p.accent; return (
                      <button key={p.nombre} onClick={() => setEditando(prev => ({ ...prev, colores: { accent: p.accent, accentLight: p.accentLight, bg: p.bg, surface: p.surface, border: p.border } }))}
                        style={{ border: `2px solid ${sel ? p.accent : "#E2DDD4"}`, borderRadius: 12, padding: "12px 10px", cursor: "pointer", background: sel ? p.accentLight : "#F5F2EC", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: "inherit" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: p.accent }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: sel ? p.accent : "#7A7570" }}>{p.nombre}</span>
                        {sel && <span style={{ fontSize: 10, color: p.accent }}>✓ Activa</span>}
                      </button>
                    ); })}
                  </div>
                </div>
                <div style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 14, padding: "20px 24px" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1A3F2F", marginBottom: 4 }}>📂 Grupos y categorías</h3>
                  <p style={{ fontSize: 12, color: "#7A7570", marginBottom: 16 }}>Los grupos y categorías son independientes para cada condominio. Haz clic en un grupo para expandirlo.</p>

                  {/* Lista acordeón de grupos */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                    {grupos.map(grupo => {
                      const catsDelGrupo = categorias.filter(c => c.grupo_id === grupo.id);
                      const abierto = gruposAbiertos[grupo.id] || false;
                      const puedeEliminar = catsDelGrupo.length === 0;
                      const GrupoIcon = ICONOS_GRUPO[grupo.icono] || Package;
                      return (
                        <div key={grupo.id} style={{ border: "1px solid #E2DDD4", borderRadius: 12, overflow: "hidden" }}>
                          {/* Header del grupo */}
                          <div
                            onClick={() => setGruposAbiertos(p => ({ ...p, [grupo.id]: !abierto }))}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", background: abierto ? "#F5F2EC" : "white", transition: "background 0.15s" }}
                          >
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#F5F2EC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <GrupoIcon size={14} color="#7A7570" strokeWidth={1.75} />
                            </div>
                            {renombrandoGrupo?.id === grupo.id ? (
                              <input
                                autoFocus
                                value={renombrandoGrupo.label}
                                onChange={e => setRenombrandoGrupo(p => ({ ...p, label: e.target.value }))}
                                onKeyDown={e => { if (e.key === "Enter") handleRenombrarGrupo(); if (e.key === "Escape") setRenombrandoGrupo(null); }}
                                onClick={e => e.stopPropagation()}
                                style={{ ...inputStyle, flex: 1, background: "white", fontSize: 13, padding: "5px 10px" }}
                              />
                            ) : (
                              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1A3F2F" }}>{grupo.label}</span>
                            )}
                            <span style={{ fontSize: 10, background: "#F5F2EC", color: "#7A7570", borderRadius: 999, padding: "2px 7px", border: "1px solid #E2DDD4", flexShrink: 0 }}>
                              {catsDelGrupo.filter(c => c.activa).length} activa{catsDelGrupo.filter(c => c.activa).length !== 1 ? "s" : ""}
                              {catsDelGrupo.filter(c => !c.activa).length > 0 ? ` · ${catsDelGrupo.filter(c => !c.activa).length} inactiva${catsDelGrupo.filter(c => !c.activa).length !== 1 ? "s" : ""}` : ""}
                            </span>
                            {renombrandoGrupo?.id === grupo.id ? (
                              <>
                                <button onClick={e => { e.stopPropagation(); handleRenombrarGrupo(); }} style={{ background: "#2D6A4F", color: "white", border: "none", borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>✓</button>
                                <button onClick={e => { e.stopPropagation(); setRenombrandoGrupo(null); }} style={{ background: "#F5F2EC", color: "#7A7570", border: "1px solid #E2DDD4", borderRadius: 7, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                              </>
                            ) : (
                              <>
                                <button onClick={e => { e.stopPropagation(); setRenombrandoGrupo({ id: grupo.id, label: grupo.label }); }} style={{ background: "none", border: "1px solid #E2DDD4", borderRadius: 7, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#7A7570", flexShrink: 0 }} title="Renombrar">✏️</button>
                                <button onClick={e => { e.stopPropagation(); if (puedeEliminar) setConfirmando({ tipo: "grupo", id: grupo.id, nombre: grupo.label }); }} disabled={!puedeEliminar} style={{ background: puedeEliminar ? "#FDECEA" : "none", border: `1px solid ${puedeEliminar ? "#C0392B" : "#E2DDD4"}`, borderRadius: 7, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: puedeEliminar ? "pointer" : "not-allowed", opacity: puedeEliminar ? 1 : 0.3, flexShrink: 0 }} title={puedeEliminar ? "Eliminar grupo" : "Tiene categorías"}>🗑</button>
                              </>
                            )}
                            <ChevronDown size={14} color="#7A7570" strokeWidth={2} style={{ transition: "transform 0.2s", transform: abierto ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
                          </div>

                          {/* Cuerpo expandible */}
                          {abierto && (
                            <div style={{ borderTop: "1px solid #E2DDD4", padding: "12px 14px 12px 52px", background: "#FDFBF7" }}>
                              {catsDelGrupo.length === 0 ? (
                                <p style={{ fontSize: 12, color: "#7A7570" }}>Sin categorías. Crea una abajo.</p>
                              ) : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                  {catsDelGrupo.map(cat => (
                                    <div key={cat.id} style={{ display: "flex", alignItems: "center" }}>
                                      <button
                                        onClick={() => handleToggleCategoria(cat.id, cat.activa)}
                                        style={{ background: cat.activa ? "#D8EFE4" : "#F5F2EC", color: cat.activa ? "#2D6A4F" : "#7A7570", border: `2px solid ${cat.activa ? "#2D6A4F" : "#E2DDD4"}`, borderRadius: cat.custom ? "999px 0 0 999px" : 999, padding: "5px 11px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", borderRight: cat.custom ? "none" : undefined }}
                                      >{cat.emoji} {cat.label} {cat.activa ? "✓" : "+"}</button>
                                      {cat.custom && (
                                        <button onClick={() => setConfirmando({ tipo: "categoria", id: cat.id, nombre: cat.label })} style={{ background: "#FDECEA", color: "#C0392B", border: "2px solid #E2DDD4", borderLeft: "1px solid #E2DDD4", borderRadius: "0 999px 999px 0", padding: "5px 9px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p style={{ fontSize: 11, color: "#7A7570", marginTop: 8 }}>Chip verde = activa · Chip gris = inactiva, clic para activar</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Nuevo grupo */}
                  <div style={{ borderTop: "1px solid #E2DDD4", paddingTop: 16, marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#7A7570", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>+ Nuevo grupo</p>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 130 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#7A7570", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Nombre</label>
                        <input style={{ ...inputStyle, background: "white" }} placeholder="Ej: Tecnología..." value={nuevoGrupo.label} onChange={e => { setNuevoGrupo(p => ({ ...p, label: e.target.value })); setGrupoError(""); }} onKeyDown={e => e.key === "Enter" && handleAgregarGrupo()} />
                      </div>
                      <div style={{ minWidth: 130 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#7A7570", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Ícono</label>
                        <select value={nuevoGrupo.icono} onChange={e => setNuevoGrupo(p => ({ ...p, icono: e.target.value }))} style={{ ...inputStyle, appearance: "none", background: "white" }}>
                          {Object.keys(ICONOS_GRUPO).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "transparent", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, display: "block" }}>–</label>
                        <button onClick={handleAgregarGrupo} style={{ background: "#2D6A4F", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Agregar</button>
                      </div>
                    </div>
                    {grupoError && <p style={{ fontSize: 12, color: "#C0392B", marginTop: 8 }}>⚠ {grupoError}</p>}
                  </div>

                  {/* Nueva categoría */}
                  <div style={{ borderTop: "1px solid #E2DDD4", paddingTop: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#7A7570", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>+ Nueva categoría</p>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#7A7570", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Ícono</label>
                        <div style={{ position: "relative" }}>
                          <button onClick={() => setMostrarEmojis(m => !m)} style={{ background: "#F5F2EC", border: "1.5px solid #E2DDD4", borderRadius: 10, padding: "9px 14px", fontSize: 20, cursor: "pointer" }}>{nuevaCat.emoji}</button>
                          {mostrarEmojis && (
                            <div style={{ position: "absolute", top: "110%", left: 0, zIndex: 10, background: "white", border: "1.5px solid #E2DDD4", borderRadius: 12, padding: 10, boxShadow: "0 8px 32px rgba(28,26,22,0.13)", display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4, width: 280 }}>
                              {EMOJIS_SUGERIDOS.map(e => <button key={e} onClick={() => { setNuevaCat(p => ({ ...p, emoji: e })); setMostrarEmojis(false); }} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: 4, borderRadius: 6 }} onMouseEnter={ev => ev.currentTarget.style.background = "#D8EFE4"} onMouseLeave={ev => ev.currentTarget.style.background = "none"}>{e}</button>)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 110 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#7A7570", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Nombre</label>
                        <input style={{ ...inputStyle, background: "white" }} placeholder="Ej: Cerrajero..." value={nuevaCat.label} onChange={e => { setNuevaCat(p => ({ ...p, label: e.target.value })); setCatError(""); }} onKeyDown={e => e.key === "Enter" && handleAgregarCategoria()} />
                      </div>
                      <div style={{ flex: 1, minWidth: 110 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#7A7570", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Grupo</label>
                        <select value={nuevaCat.grupo || ""} onChange={e => setNuevaCat(p => ({ ...p, grupo: e.target.value }))} style={{ ...inputStyle, appearance: "none", background: "white" }}>
                          {grupos.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "transparent", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, display: "block" }}>–</label>
                        <button onClick={handleAgregarCategoria} style={{ background: "#2D6A4F", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Agregar</button>
                      </div>
                    </div>
                    {catError && <p style={{ fontSize: 12, color: "#C0392B", marginTop: 8 }}>⚠ {catError}</p>}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={handleGuardarCondominio} style={{ background: guardado ? "#27AE60" : "#2D6A4F", color: "#fff", border: "none", borderRadius: 12, padding: "12px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.3s" }}>{guardado ? "✓ Guardado" : "Guardar configuración"}</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      {editandoServicio && <ModalEditarServicio />}

      {/* ── Modal Confirmación ── */}
      {confirmando && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: 24 }}>
          <div className="fade-up" style={{ background: "white", border: "1px solid #E2DDD4", borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(28,26,22,0.2)", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FDECEA", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22 }}>⚠</div>
            <h3 className="serif" style={{ fontSize: 20, color: "#1A3F2F", marginBottom: 8 }}>
              {confirmando.tipo === "categoria" ? "¿Eliminar categoría?" : confirmando.tipo === "grupo" ? "¿Eliminar grupo?" : confirmando.tipo === "rechazar" ? "¿Rechazar servicio?" : "¿Eliminar servicio?"}
            </h3>
            <p style={{ fontSize: 13, color: "#7A7570", lineHeight: 1.6, marginBottom: 24 }}>
              {confirmando.tipo === "categoria"
                ? <>Vas a eliminar la categoría <strong>"{confirmando.nombre}"</strong>. Esta acción no se puede deshacer.</>
                : confirmando.tipo === "grupo"
                ? <>Vas a eliminar el grupo <strong>"{confirmando.nombre}"</strong>. Esta acción no se puede deshacer.</>
                : <>Vas a {confirmando.tipo === "rechazar" ? "rechazar" : "eliminar"} a <strong>"{confirmando.nombre}"</strong>. Esta acción no se puede deshacer.</>
              }
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmando(null)} style={{ flex: 1, background: "#F5F2EC", border: "1.5px solid #E2DDD4", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#7A7570" }}>Cancelar</button>
              <button
                onClick={() => {
                  if (confirmando.tipo === "categoria") handleEliminarCategoria(confirmando.id);
                  else if (confirmando.tipo === "grupo") handleEliminarGrupo(confirmando.id);
                  else handleRechazar(confirmando.id);
                }}
                style={{ flex: 1, background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                {confirmando.tipo === "rechazar" ? "Rechazar" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── App Principal ─────────────────────────────────────────────────
export default function App() {
  const [condominios, setCondominios] = useState([]);
  const [gruposPublicos, setGruposPublicos] = useState([]);
  const [categoriasPublicas, setCategoriasPublicas] = useState([]);
  const [cargandoApp, setCargandoApp] = useState(true);
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem("1dato_admin_token") || null);
  const [vistaApp, setVistaApp] = useState("publica");

  const handleSetAdminToken = (token) => {
    if (token) sessionStorage.setItem("1dato_admin_token", token);
    else sessionStorage.removeItem("1dato_admin_token");
    setAdminToken(token);
  };

  const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
  const esAdmin = path === "admin";

  useEffect(() => {
    const init = async () => {
      const [conds] = await Promise.all([query("condominios")]);
      setCondominios(Array.isArray(conds) ? conds : []);
      // Si es vista pública, cargar grupos y categorías del slug actual
      if (!esAdmin && path) {
        const [gs, cs] = await Promise.all([
          query("grupos", { filter: `condominio_slug=eq.${path}&order=orden.asc` }),
          query("categorias", { filter: `condominio_slug=eq.${path}&activa=eq.true` }),
        ]);
        setGruposPublicos(Array.isArray(gs) ? gs : []);
        setCategoriasPublicas(Array.isArray(cs) ? cs : []);
      }
      setCargandoApp(false);
    };
    init();
  }, []);

  const handleActualizarCondominio = (datos) => setCondominios(prev => prev.map(c => c.slug === datos.slug ? datos : c));
  const handleLogout = async () => { if (adminToken) await authLogout(adminToken); handleSetAdminToken(null); };

  if (cargandoApp) return <><style>{defaultCSS}</style><Cargando mensaje="Iniciando 1dato..." /></>;

  if (esAdmin) {
    document.title = "1dato | Panel Admin";
    const adminCSS = buildCSS({ accent: "#3D4F6B", accentLight: "#D9DEE8", bg: "#F2F3F5", surface: "#FAFAFA", border: "#DDE0E6" }, true);
    return (
      <>
        <style>{adminCSS}</style>
        {!adminToken ? <LoginAdmin onLogin={handleSetAdminToken} /> : <PanelAdmin condominios={condominios} onActualizarCondominio={handleActualizarCondominio} onLogout={handleLogout} adminToken={adminToken} />}
      </>
    );
  }

  const cond = condominios.find(c => c.slug === path);
  if (!cond) {
    document.title = "1dato | Condominio no encontrado";
    return (
      <>
        <style>{defaultCSS}</style>
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ textAlign: "center", maxWidth: 380 }}>
              <p style={{ fontSize: 48 }}>🏠</p>
              <h2 className="serif" style={{ fontSize: 26, marginTop: 16 }}>Condominio no encontrado</h2>
              <p style={{ color: "var(--text-muted)", marginTop: 10, lineHeight: 1.6 }}>La URL no corresponde a ningún condominio registrado.</p>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  document.title = `1dato | ${cond.nombre}`;
  const css = buildCSS(cond.colores);
  return (
    <>
      <style>{css}</style>
      {vistaApp === "publica" && <VistaPublica condominio={cond} grupos={gruposPublicos} categorias={categoriasPublicas} onProponer={() => setVistaApp("formulario")} />}
      {vistaApp === "formulario" && <FormularioPropuesta condominio={cond} categorias={categoriasPublicas} onVolver={() => setVistaApp("publica")} />}
    </>
  );
}