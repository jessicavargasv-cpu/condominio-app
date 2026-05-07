import { useState, useEffect, useRef } from "react";
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs";
import {
  Wrench, Zap, Flame, Scissors, Eye, Leaf, Waves, Bug,
  PawPrint, Dog, Cat,
  Car, CircleDot, Gauge,
  HeartPulse, Baby, Users,
  FileText, Package, MoreHorizontal,
  Search, ChevronDown, ChevronRight, ArrowRight, Phone, Star, Shield,
  PlusCircle, X, MessageCircle, Mail
} from "lucide-react";

// ── CONFIGURACIÓN SUPABASE ────────────────────────────────────────
const SUPABASE_URL = "https://gztkowyoztqupeplhvev.supabase.co";
const SUPABASE_KEY = "sb_publishable_3mzA7ePIapL8XEhlno1bZQ_jU0sF9h2";

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

const IconoCat = ({ id, size = 18, color = "currentColor" }) => {
  const Ic = ICONOS_CAT[id] || ICONOS_CAT.default;
  return <Ic size={size} color={color} strokeWidth={1.75} />;
};

// ── Grupos ────────────────────────────────────────────────────────
const GRUPOS = [
  { id: "hogar",      label: "Hogar",             Icon: Wrench },
  { id: "jardin",     label: "Jardín",             Icon: Leaf },
  { id: "mascotas",   label: "Mascotas",           Icon: PawPrint },
  { id: "automotriz", label: "Automotriz",         Icon: Car },
  { id: "personas",   label: "Personas y Cuidado", Icon: Users },
  { id: "asesorias",  label: "Asesorías",          Icon: FileText },
  { id: "otros",      label: "Otros",              Icon: Package },
];

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
const buildCSS = (c) => `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
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
  body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); }
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

// ── Tarjeta servicio ──────────────────────────────────────────────
const ServicioCard = ({ p, todasCats }) => (
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
      <div>
        <p style={{ fontWeight: 600, fontSize: 14 }}>{p.nombre}</p>
        <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
          <Phone size={10} strokeWidth={2} /> {p.telefono}
        </p>
      </div>
      <Badge categoriaId={p.categoria} todasCats={todasCats} />
    </div>
    {p.descripcion && <p style={{ fontSize: 12, color: "#4A4540", lineHeight: 1.6 }}>{p.descripcion}</p>}
    <span style={{
      alignSelf: "flex-start", fontSize: 11, fontWeight: 600,
      color: p.recomienda ? "var(--accent)" : "var(--warn)",
      background: p.recomienda ? "var(--accent-light)" : "var(--warn-light)",
      padding: "2px 8px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      {p.recomienda ? <><Star size={9} strokeWidth={2} /> Recomendado</> : "👎 No recomendado"}
    </span>
  </div>
);

// ── Modal Búsqueda ────────────────────────────────────────────────
const ModalBusqueda = ({ servicios, todasCats, onCerrar, onSeleccionar }) => {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const resultados = q.trim().length < 2 ? [] : servicios.filter(p =>
    p.nombre.toLowerCase().includes(q.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(q.toLowerCase()) ||
    todasCats.find(c => c.id === p.categoria)?.label.toLowerCase().includes(q.toLowerCase())
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
  const [modalBusqueda, setModalBusqueda] = useState(false);
  const [modalContacto, setModalContacto] = useState(false);

  const NavLink = ({ id, label }) => (
    <button onClick={() => onNavegar(id)} style={{
      background: "none", border: "none",
      borderBottom: `2px solid ${vistaActiva === id ? "var(--accent)" : "transparent"}`,
      padding: "4px 2px", fontSize: 13, fontWeight: vistaActiva === id ? 600 : 400,
      color: vistaActiva === id ? "var(--accent)" : "var(--text-muted)",
      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap",
    }}
      onMouseEnter={e => { if (vistaActiva !== id) e.currentTarget.style.color = "var(--text)"; }}
      onMouseLeave={e => { if (vistaActiva !== id) e.currentTarget.style.color = "var(--text-muted)"; }}
    >{label}</button>
  );

  return (
    <>
      <nav style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 100,
        padding: "0 32px", display: "flex", alignItems: "center", gap: 0, height: 56,
      }}>
        {/* Logo 1dato — ícono chat + texto */}
        <button onClick={() => onNavegar("inicio")} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginRight: 12,
        }}>
          {/* Ícono chat SVG */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="var(--accent)"/>
            <circle cx="9" cy="14" r="2.2" fill="white"/>
            <circle cx="14" cy="14" r="2.2" fill="white"/>
            <circle cx="19" cy="14" r="2.2" fill="white"/>
            <path d="M6 19 L6 22 L10 19" fill="var(--accent)"/>
          </svg>
          <span style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "var(--accent)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.5px" }}>1</span>
            <span style={{ fontSize: 17, fontWeight: 300, color: "var(--text)", fontFamily: "'DM Sans', sans-serif" }}>dato</span>
          </span>
        </button>

        {/* Separador 1 */}
        <div style={{ width: 1, height: 28, background: "var(--border)", margin: "0 16px", flexShrink: 0 }} />

        {/* Nombre condominio */}
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1A3F2F", whiteSpace: "nowrap", marginRight: 20, flexShrink: 0 }}>
          {condominio.nombre}
        </span>

        {/* Separador 2 */}
        <div style={{ width: 1, height: 28, background: "var(--border)", marginRight: 20, flexShrink: 0 }} />

        {/* Links */}
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

        {/* Lupa */}
        <button onClick={() => setModalBusqueda(true)} style={{
          background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 10,
          width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "border-color 0.15s", flexShrink: 0,
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
        >
          <Search size={16} color="var(--text-muted)" strokeWidth={2} />
        </button>
      </nav>

      {modalBusqueda && (
        <ModalBusqueda
          servicios={servicios}
          todasCats={todasCats}
          onCerrar={() => setModalBusqueda(false)}
          onSeleccionar={(catId) => { onNavegar("servicios", catId); }}
        />
      )}
      {modalContacto && <ModalContacto condominio={condominio} onCerrar={() => setModalContacto(false)} />}
    </>
  );
};

// ── Hero ──────────────────────────────────────────────────────────
const Hero = ({ condominio, onNavegar }) => (
  <div style={{
    background: "linear-gradient(135deg, #ffffff 0%, #e8f5ee 60%, #c8e8d8 100%)",
    padding: "80px 32px 88px", textAlign: "center", position: "relative", overflow: "hidden",
  }}>
    {/* Manchas aurora suaves */}
    <div style={{ position: "absolute", top: -60, right: -80, width: 400, height: 300, borderRadius: "50%", background: "var(--accent)", opacity: 0.06, pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: -40, left: -60, width: 300, height: 220, borderRadius: "50%", background: "var(--accent)", opacity: 0.05, pointerEvents: "none" }} />

    <div className="fade-up" style={{ position: "relative", zIndex: 1 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>
        {condominio.nombre}
      </p>
      <h1 className="serif" style={{ fontSize: 48, lineHeight: 1.15, marginBottom: 16, color: "#1A3F2F" }}>
        Cuando un vecino tiene<br />el dato, todos ganan
      </h1>
      <p style={{ fontSize: 16, color: "#4A7C6F", lineHeight: 1.65, maxWidth: 460, margin: "0 auto 32px" }}>
        El directorio de servicios que recomiendan tus propios vecinos.
      </p>
      <button onClick={() => onNavegar("servicios")} style={{
        background: "var(--accent)", color: "#fff", border: "none",
        borderRadius: 10, padding: "13px 28px", fontSize: 14, fontWeight: 700,
        cursor: "pointer", fontFamily: "inherit", display: "inline-flex",
        alignItems: "center", gap: 8, transition: "opacity 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        Ver servicios <ArrowRight size={15} strokeWidth={2.5} />
      </button>
    </div>
  </div>
);

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
const VistaServicios = ({ condominio, todasCats, servicios, cargando, filtroGrupoInicial, filtroCatInicial }) => {
  const [grupoActivo, setGrupoActivo] = useState(filtroGrupoInicial || GRUPOS[0].id);
  const [catActiva, setCatActiva] = useState(filtroCatInicial || null);
  const [acordeonesAbiertos, setAcordeonesAbiertos] = useState({});

  // Sincronizar si llegan filtros externos (desde búsqueda)
  useEffect(() => {
    if (filtroGrupoInicial) setGrupoActivo(filtroGrupoInicial);
    if (filtroCatInicial) {
      setCatActiva(filtroCatInicial);
      const cat = todasCats.find(c => c.id === filtroCatInicial);
      if (cat) setGrupoActivo(cat.grupo);
      setAcordeonesAbiertos(prev => ({ ...prev, [filtroCatInicial]: true }));
    }
  }, [filtroGrupoInicial, filtroCatInicial]);

  const serviciosAprobados = servicios.filter(s => s.estado === "aprobado");

  // Grupos con categorías activas del condominio
  const gruposConCats = GRUPOS.map(g => ({
    ...g,
    cats: todasCats.filter(c => c.grupo === g.id && condominio.categorias_activas.includes(c.id)),
  })).filter(g => g.cats.length > 0);

  // Contar servicios por grupo
  const contarGrupo = (grupoId) => {
    const cats = todasCats.filter(c => c.grupo === grupoId && condominio.categorias_activas.includes(c.id));
    return serviciosAprobados.filter(s => cats.some(c => c.id === s.categoria)).length;
  };

  // Contar servicios por categoría
  const contarCat = (catId) => serviciosAprobados.filter(s => s.categoria === catId).length;

  // Servicios del grupo activo, por categoría
  const grupoActualObj = gruposConCats.find(g => g.id === grupoActivo);
  const catsDelGrupo = grupoActualObj?.cats || [];

  const toggleAcordeon = (catId) => {
    setAcordeonesAbiertos(prev => ({ ...prev, [catId]: !prev[catId] }));
    setCatActiva(catId);
  };

  return (
    <div style={{ display: "flex", flex: 1 }}>
      {/* Sidebar izquierdo */}
      <div style={{
        width: "var(--sidebar-w)", flexShrink: 0,
        borderRight: "1px solid var(--border)", background: "var(--surface)",
        position: "sticky", top: 56, height: "calc(100vh - 56px)", overflowY: "auto",
        padding: "16px 0",
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", padding: "0 16px 10px" }}>Categorías</p>
        {gruposConCats.map(grupo => {
          const activo = grupoActivo === grupo.id;
          const total = contarGrupo(grupo.id);
          return (
            <button key={grupo.id} onClick={() => { setGrupoActivo(grupo.id); setCatActiva(null); setAcordeonesAbiertos({}); }}
              style={{
                width: "100%", textAlign: "left", background: activo ? "var(--accent-light)" : "none",
                border: "none", padding: "10px 16px", cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s",
                borderLeft: `3px solid ${activo ? "var(--accent)" : "transparent"}`,
              }}
              onMouseEnter={e => { if (!activo) e.currentTarget.style.background = "var(--bg)"; }}
              onMouseLeave={e => { if (!activo) e.currentTarget.style.background = "none"; }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: activo ? "var(--accent)" : "var(--bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${activo ? "var(--accent)" : "var(--border)"}`,
              }}>
                <grupo.Icon size={15} color={activo ? "#fff" : "var(--text-muted)"} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: activo ? 600 : 400, color: activo ? "var(--accent)" : "var(--text)", lineHeight: 1.2 }}>{grupo.label}</p>
                {total > 0 && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{total} servicio{total !== 1 ? "s" : ""}</p>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Contenido principal — acordeón */}
      <div style={{ flex: 1, padding: "24px 32px 56px", minWidth: 0 }}>
        {cargando ? <Cargando mensaje="Cargando servicios..." /> : (
          <>
            {grupoActualObj && (
              <div style={{ marginBottom: 24 }} className="fade-up">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <grupoActualObj.Icon size={20} color="var(--accent)" strokeWidth={1.75} />
                  <h2 className="serif" style={{ fontSize: 26 }}>{grupoActualObj.label}</h2>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{contarGrupo(grupoActivo)} servicio{contarGrupo(grupoActivo) !== 1 ? "s" : ""} disponible{contarGrupo(grupoActivo) !== 1 ? "s" : ""}</p>
              </div>
            )}

            {catsDelGrupo.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No hay categorías activas en este grupo.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {catsDelGrupo.map(cat => {
                  const abierto = acordeonesAbiertos[cat.id] ?? false;
                  const serviciosCat = serviciosAprobados.filter(s => s.categoria === cat.id);
                  const total = serviciosCat.length;
                  return (
                    <div key={cat.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
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
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                              {serviciosCat.map(p => <ServicioCard key={p.id} p={p} todasCats={todasCats} />)}
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
const VistaPublica = ({ condominio, todasCats, onProponer }) => {
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
      const cat = todasCats.find(c => c.id === catId);
      setFiltroGrupo(cat?.grupo || null);
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
        todasCats={todasCats}
        onProponer={onProponer}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {vista === "inicio" && (
          <>
            <Hero condominio={condominio} onNavegar={navegar} />
            <ComoFunciona onProponer={onProponer} />
          </>
        )}
        {vista === "servicios" && (
          <VistaServicios
            condominio={condominio}
            todasCats={todasCats}
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
const FormularioPropuesta = ({ condominio, todasCats, onVolver }) => {
  const [form, setForm] = useState({ nombre: "", categoria: "", telefono: "", descripcion: "", recomienda: true });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [serviciosCount, setServiciosCount] = useState(0);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cats = todasCats.filter(c => condominio.categorias_activas.includes(c.id));
  const valido = form.nombre && form.categoria && form.telefono;

  useEffect(() => {
    query("proveedores", { filter: `condominio=eq.${condominio.slug}&estado=eq.aprobado`, select: "id" })
      .then(data => setServiciosCount(Array.isArray(data) ? data.length : 0));
  }, [condominio.slug]);

  const handleEnviar = async () => {
    if (!valido) return;
    setEnviando(true);
    await query("proveedores", {
      insert: { condominio: condominio.slug, nombre: form.nombre, categoria: form.categoria, telefono: form.telefono, descripcion: form.descripcion, recomienda: form.recomienda, estado: "pendiente" },
    });
    setEnviando(false);
    setEnviado(true);
  };

  const gruposConCats = GRUPOS.map(g => ({ ...g, cats: cats.filter(c => c.grupo === g.id) })).filter(g => g.cats.length > 0);

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
          <button onClick={onVolver} style={{ marginTop: 24, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Volver al directorio
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "40px 32px" }}>
        <button onClick={onVolver} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: "0 0 24px", fontFamily: "inherit" }}>← Volver</button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 24, maxWidth: 900, margin: "0 auto", alignItems: "start" }}>

          {/* Columna izquierda — motivacional */}
          <div style={{
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
          </div>

          {/* Columna derecha — formulario */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "32px", boxShadow: "var(--shadow)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 4 }}>{condominio.nombre}</p>
            <h2 className="serif" style={{ fontSize: 24, marginBottom: 4 }}>Sugerir un servicio</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>La información será revisada antes de publicarse.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label style={labelStyle}>Nombre o empresa *</label><input style={inputStyle} value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Ej: Carlos Muñoz / Limpieza Total SpA" /></div>
              <div>
                <label style={labelStyle}>Categoría *</label>
                <select style={{ ...inputStyle, appearance: "none" }} value={form.categoria} onChange={e => set("categoria", e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {gruposConCats.map(g => (
                    <optgroup key={g.id} label={g.label}>
                      {g.cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div><label style={labelStyle}>Teléfono / WhatsApp *</label><input style={inputStyle} value={form.telefono} onChange={e => set("telefono", e.target.value)} placeholder="+56 9 XXXX XXXX" /></div>
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
              <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }} className="fade-up">
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "36px 32px", boxShadow: "var(--shadow)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Shield size={22} color="var(--accent)" strokeWidth={1.75} />
            </div>
            <h2 className="serif" style={{ fontSize: 26 }}>Panel Administrador</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>Acceso restringido</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="admin@ejemplo.com" onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
            <div><label style={labelStyle}>Contraseña</label><input style={inputStyle} type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
            {error && <p style={{ fontSize: 13, color: "var(--warn)", background: "var(--warn-light)", padding: "8px 12px", borderRadius: 8 }}>⚠ {error}</p>}
            <button onClick={handleLogin} disabled={cargando} style={{ marginTop: 4, background: cargando ? "var(--border)" : "var(--accent)", color: cargando ? "var(--text-muted)" : "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 600, cursor: cargando ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {cargando ? "⟳ Verificando..." : "Ingresar"}
            </button>
          </div>
        </div>
      </div>
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

// ── Panel Admin ───────────────────────────────────────────────────
const PanelAdmin = ({ condominios, todasCats, setTodasCats, onActualizarCondominio, onLogout }) => {
  const [condominioActivo, setCondominioActivo] = useState(condominios[0]?.slug || "");
  const [tab, setTab] = useState("servicios");
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [guardado, setGuardado] = useState(false);
  const [nuevaCat, setNuevaCat] = useState({ label: "", emoji: "🏠", grupo: "hogar" });
  const [catError, setCatError] = useState("");
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  const [editandoServicio, setEditandoServicio] = useState(null);

  const cond = condominios.find(c => c.slug === condominioActivo);
  useEffect(() => { if (cond) setEditando({ ...cond, colores: { ...cond.colores } }); }, [condominioActivo, condominios]);
  useEffect(() => {
    const cargar = async () => { setCargando(true); const data = await query("proveedores", { filter: `condominio=eq.${condominioActivo}&order=id.desc` }); setServicios(Array.isArray(data) ? data : []); setCargando(false); };
    if (condominioActivo) cargar();
  }, [condominioActivo]);

  const handleAprobar = async (id) => { await query("proveedores", { update: { where: `id=eq.${id}`, data: { estado: "aprobado" } } }); setServicios(p => p.map(x => x.id === id ? { ...x, estado: "aprobado" } : x)); };
  const handleRechazar = async (id) => { await query("proveedores", { remove: `id=eq.${id}` }); setServicios(p => p.filter(x => x.id !== id)); };
  const handleEditar = async (id, datos) => { await query("proveedores", { update: { where: `id=eq.${id}`, data: datos } }); setServicios(p => p.map(x => x.id === id ? { ...x, ...datos } : x)); setEditandoServicio(null); };
  const handleGuardarCondominio = async () => { await query("condominios", { update: { where: `slug=eq.${condominioActivo}`, data: { nombre: editando.nombre, colores: editando.colores, categorias_activas: editando.categorias_activas } } }); onActualizarCondominio(editando); setGuardado(true); setTimeout(() => setGuardado(false), 2000); };
  const handleAgregarCategoria = async () => {
    const label = nuevaCat.label.trim();
    if (!label) { setCatError("Escribe un nombre."); return; }
    const id = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (todasCats.find(c => c.id === id)) { setCatError("Ya existe."); return; }
    await query("categorias_custom", { insert: { id, label, emoji: nuevaCat.emoji, grupo: nuevaCat.grupo } });
    const nueva = { id, label, emoji: nuevaCat.emoji, grupo: nuevaCat.grupo, custom: true };
    const nuevasCats = [...todasCats, nueva];
    const nuevasActivas = [...editando.categorias_activas, id];
    setTodasCats(nuevasCats);
    const nuevoEditando = { ...editando, categorias_activas: nuevasActivas };
    setEditando(nuevoEditando);
    await query("condominios", { update: { where: `slug=eq.${condominioActivo}`, data: { categorias_activas: nuevasActivas } } });
    onActualizarCondominio(nuevoEditando);
    setNuevaCat({ label: "", emoji: "🏠", grupo: "hogar" }); setCatError(""); setMostrarEmojis(false);
  };
  const handleEliminarCategoria = async (id) => { await query("categorias_custom", { remove: `id=eq.${id}` }); setTodasCats(prev => prev.filter(c => c.id !== id)); setEditando(prev => ({ ...prev, categorias_activas: prev.categorias_activas.filter(c => c !== id) })); };

  if (!editando) return <Cargando />;
  const pendientes = servicios.filter(p => p.estado === "pendiente");
  const aprobados = servicios.filter(p => p.estado === "aprobado");

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{ background: tab === id ? "var(--accent)" : "transparent", color: tab === id ? "#fff" : "var(--text-muted)", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>{label}</button>
  );

  const FilaServicio = ({ p, esPendiente }) => (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
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
        {esPendiente && <button onClick={() => handleAprobar(p.id)} style={{ background: "var(--accent-light)", color: "var(--accent)", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>✓ Aprobar</button>}
        <button onClick={() => setEditandoServicio({ ...p })} style={{ background: "var(--gold-light)", color: "var(--gold)", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>✏️ Editar</button>
        <button onClick={() => handleRechazar(p.id)} style={{ background: "var(--warn-light)", color: "var(--warn)", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{esPendiente ? "✕ Rechazar" : "🗑 Eliminar"}</button>
      </div>
    </div>
  );

  const ModalEditarServicio = () => {
    const [form, setForm] = useState({ ...editandoServicio });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const cats = todasCats.filter(c => cond.categorias_activas.includes(c.id));
    const gruposConCats = GRUPOS.map(g => ({ ...g, cats: cats.filter(c => c.grupo === g.id) })).filter(g => g.cats.length > 0);
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 24 }} onClick={e => e.target === e.currentTarget && setEditandoServicio(null)}>
        <div className="fade-up" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(28,26,22,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 className="serif" style={{ fontSize: 22 }}>Editar servicio</h3>
            <button onClick={() => setEditandoServicio(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
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
                {[true, false].map(v => <button key={String(v)} onClick={() => set("recomienda", v)} style={{ flex: 1, padding: 10, border: `2px solid ${form.recomienda === v ? (v ? "var(--accent)" : "var(--warn)") : "var(--border)"}`, background: form.recomienda === v ? (v ? "var(--accent-light)" : "var(--warn-light)") : "var(--surface)", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: form.recomienda === v ? (v ? "var(--accent)" : "var(--warn)") : "var(--text-muted)" }}>{v ? "👍 Sí" : "👎 No"}</button>)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditandoServicio(null)} style={{ flex: 1, background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "var(--text-muted)" }}>Cancelar</button>
              <button onClick={() => handleEditar(form.id, { nombre: form.nombre, categoria: form.categoria, telefono: form.telefono, descripcion: form.descripcion, recomienda: form.recomienda })} style={{ flex: 2, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Guardar</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 3 }}>Panel Administrador · 1dato</p>
              <h1 className="serif" style={{ fontSize: 26 }}>{cond?.nombre}</h1>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <select value={condominioActivo} onChange={e => setCondominioActivo(e.target.value)} style={{ ...inputStyle, width: "auto", fontSize: 13, fontWeight: 600 }}>
                {condominios.map(c => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
              </select>
              <button onClick={onLogout} style={{ background: "var(--warn-light)", color: "var(--warn)", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cerrar sesión</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[{ label: "Pendientes", val: pendientes.length, bg: "var(--gold-light)", color: "var(--gold)" }, { label: "Aprobados", val: aprobados.length, bg: "var(--accent-light)", color: "var(--accent)" }, { label: "Total", val: servicios.length, bg: "var(--surface)", color: "var(--text)" }].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "14px 18px" }}>
                <p style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: "'DM Serif Display', serif" }}>{s.val}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 4, display: "inline-flex", gap: 2, marginBottom: 24, flexWrap: "wrap" }}>
            <TabBtn id="servicios" label={`📋 Servicios ${pendientes.length > 0 ? `(${pendientes.length})` : ""}`} />
            <TabBtn id="carga_masiva" label="📥 Carga Masiva" />
            <TabBtn id="configuracion" label="⚙️ Configuración" />
          </div>

          {tab === "servicios" && (cargando ? <Cargando /> : (
            <div>
              {pendientes.length > 0 && <div style={{ marginBottom: 28 }}><h3 className="serif" style={{ fontSize: 18, marginBottom: 12 }}>⏳ Pendientes ({pendientes.length})</h3><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{pendientes.map(p => <FilaServicio key={p.id} p={p} esPendiente />)}</div></div>}
              <div><h3 className="serif" style={{ fontSize: 18, marginBottom: 12 }}>✅ Aprobados ({aprobados.length})</h3>
                {aprobados.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Sin servicios aprobados aún.</p> : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{aprobados.map(p => <FilaServicio key={p.id} p={p} esPendiente={false} />)}</div>}
              </div>
            </div>
          ))}

          {tab === "carga_masiva" && <CargaMasiva condominios={condominios} todasCats={todasCats} />}

          {tab === "configuracion" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "22px 24px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>🏠 Nombre del condominio</h3>
                <input style={inputStyle} value={editando.nombre} onChange={e => setEditando(p => ({ ...p, nombre: e.target.value }))} />
              </div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "22px 24px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>🎨 Paleta de colores</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>El color se aplica en toda la vista pública incluyendo el hero.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                  {PALETAS.map(p => { const sel = editando.colores.accent === p.accent; return (
                    <button key={p.nombre} onClick={() => setEditando(prev => ({ ...prev, colores: { accent: p.accent, accentLight: p.accentLight, bg: p.bg, surface: p.surface, border: p.border } }))}
                      style={{ border: `2px solid ${sel ? p.accent : "var(--border)"}`, borderRadius: 12, padding: "12px 10px", cursor: "pointer", background: sel ? p.accentLight : "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: "inherit" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: p.accent }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: sel ? p.accent : "var(--text-muted)" }}>{p.nombre}</span>
                      {sel && <span style={{ fontSize: 10, color: p.accent }}>✓ Activa</span>}
                    </button>
                  ); })}
                </div>
              </div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "22px 24px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>📂 Categorías</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Activa/desactiva categorías o crea nuevas.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                  {todasCats.map(cat => { const activa = editando.categorias_activas.includes(cat.id); return (
                    <div key={cat.id} style={{ display: "flex", alignItems: "center" }}>
                      <button onClick={() => setEditando(prev => ({ ...prev, categorias_activas: activa ? prev.categorias_activas.filter(c => c !== cat.id) : [...prev.categorias_activas, cat.id] }))} style={{ background: activa ? "var(--accent-light)" : "var(--bg)", color: activa ? "var(--accent)" : "var(--text-muted)", border: `2px solid ${activa ? "var(--accent)" : "var(--border)"}`, borderRadius: cat.custom ? "999px 0 0 999px" : 999, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", borderRight: cat.custom ? "none" : undefined }}>{cat.emoji} {cat.label} {activa ? "✓" : "+"}</button>
                      {cat.custom && <button onClick={() => handleEliminarCategoria(cat.id)} style={{ background: "var(--warn-light)", color: "var(--warn)", border: `2px solid ${activa ? "var(--accent)" : "var(--border)"}`, borderLeft: "1px solid var(--border)", borderRadius: "0 999px 999px 0", padding: "7px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✕</button>}
                    </div>
                  ); })}
                </div>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>+ Nueva categoría</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div style={{ position: "relative" }}>
                      <button onClick={() => setMostrarEmojis(m => !m)} style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontSize: 20, cursor: "pointer" }}>{nuevaCat.emoji}</button>
                      {mostrarEmojis && (
                        <div style={{ position: "absolute", top: "110%", left: 0, zIndex: 10, background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, padding: 10, boxShadow: "var(--shadow-md)", display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4, width: 280 }}>
                          {EMOJIS_SUGERIDOS.map(e => <button key={e} onClick={() => { setNuevaCat(p => ({ ...p, emoji: e })); setMostrarEmojis(false); }} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: 4, borderRadius: 6 }} onMouseEnter={ev => ev.currentTarget.style.background = "var(--accent-light)"} onMouseLeave={ev => ev.currentTarget.style.background = "none"}>{e}</button>)}
                        </div>
                      )}
                    </div>
                    <input style={{ ...inputStyle, flex: 1, minWidth: 140 }} placeholder="Ej: Cerrajero, Pintor..." value={nuevaCat.label} onChange={e => { setNuevaCat(p => ({ ...p, label: e.target.value })); setCatError(""); }} onKeyDown={e => e.key === "Enter" && handleAgregarCategoria()} />
                    <select value={nuevaCat.grupo} onChange={e => setNuevaCat(p => ({ ...p, grupo: e.target.value }))} style={{ ...inputStyle, width: "auto", minWidth: 140, appearance: "none" }}>
                      {GRUPOS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                    </select>
                    <button onClick={handleAgregarCategoria} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Agregar</button>
                  </div>
                  {catError && <p style={{ fontSize: 12, color: "var(--warn)", marginTop: 8 }}>⚠ {catError}</p>}
                </div>
              </div>
              <button onClick={handleGuardarCondominio} style={{ background: guardado ? "#27AE60" : "var(--accent)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.3s" }}>{guardado ? "✓ ¡Configuración guardada!" : "Guardar configuración"}</button>
            </div>
          )}
        </div>
      </div>
      {editandoServicio && <ModalEditarServicio />}
    </>
  );
};

// ── App Principal ─────────────────────────────────────────────────
export default function App() {
  const [condominios, setCondominios] = useState([]);
  const [todasCats, setTodasCats] = useState(TODAS_CATEGORIAS);
  const [cargandoApp, setCargandoApp] = useState(true);
  const [adminToken, setAdminToken] = useState(null);
  const [vistaApp, setVistaApp] = useState("publica");

  const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
  const esAdmin = path === "admin";

  useEffect(() => {
    const init = async () => {
      const [conds, catsCustom] = await Promise.all([query("condominios"), query("categorias_custom")]);
      setCondominios(Array.isArray(conds) ? conds : []);
      setTodasCats([...TODAS_CATEGORIAS, ...(Array.isArray(catsCustom) ? catsCustom.map(c => ({ ...c, custom: true })) : [])]);
      setCargandoApp(false);
    };
    init();
  }, []);

  const handleActualizarCondominio = (datos) => setCondominios(prev => prev.map(c => c.slug === datos.slug ? datos : c));
  const handleLogout = async () => { if (adminToken) await authLogout(adminToken); setAdminToken(null); };

  if (cargandoApp) return <><style>{defaultCSS}</style><Cargando mensaje="Iniciando 1dato..." /></>;

  if (esAdmin) {
    const adminCSS = buildCSS({ accent: "#3D4F6B", accentLight: "#D9DEE8", bg: "#F2F3F5", surface: "#FAFAFA", border: "#DDE0E6" });
    return (
      <>
        <style>{adminCSS}</style>
        {!adminToken ? <LoginAdmin onLogin={setAdminToken} /> : <PanelAdmin condominios={condominios} todasCats={todasCats} setTodasCats={setTodasCats} onActualizarCondominio={handleActualizarCondominio} onLogout={handleLogout} />}
      </>
    );
  }

  const cond = condominios.find(c => c.slug === path);
  if (!cond) return (
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

  const css = buildCSS(cond.colores);
  return (
    <>
      <style>{css}</style>
      {vistaApp === "publica" && <VistaPublica condominio={cond} todasCats={todasCats} onProponer={() => setVistaApp("formulario")} />}
      {vistaApp === "formulario" && <FormularioPropuesta condominio={cond} todasCats={todasCats} onVolver={() => setVistaApp("publica")} />}
    </>
  );
}