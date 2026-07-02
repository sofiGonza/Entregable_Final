/* DolarApi.com — Frontend JS completo */
/* Este archivo controla toda la lógica del lado cliente:

Consumo de la API
Navegación entre vistas
Cambio de países
Visualización de cotizaciones
Conversor de monedas
Explorador de endpoints

========================================================= */



/* =========================================================
URL BASE DE LA API

Centraliza todas las peticiones al backend.
Si la ruta cambia solo se modifica aquí.
========================================================= */
const API = '/api';

// ─── Estado global ────────────────────────────────────────
/* =========================================================
ESTADO GLOBAL DE LA APLICACIÓN

Almacena información temporal utilizada por todas
las secciones del sistema.

country -> País actualmente seleccionado
activeEndpoint -> Endpoint activo
convQuotes -> Cotizaciones usadas por el conversor
convDirection -> Dirección de conversión
apiFilterCountry -> Filtro del explorador API
========================================================= */
let state = {
  country: 'argentina',
  activeEndpoint: null,      // id del endpoint tab activo
  paisesConfig: [],          // cargado del backend
  convQuotes: [],
  convDirection: 'usd-to-local',
  apiFilterCountry: 'all',
};

// ─── Configuración de países (espejo del backend para tabs/labels) ──────────
/* =========================================================
CONFIGURACIÓN DE PAÍSES

Actúa como una base de datos local.

Contiene:

Nombre del país
Bandera
Moneda oficial
Endpoints disponibles

Gracias a esta estructura los tabs y filtros se generan
dinámicamente sin programarlos uno por uno.
========================================================= */
const PAISES_META = {
  argentina: {
    nombre: 'Argentina', bandera: '🇦🇷', moneda: 'ARS',
    endpoints: [
      { id: 'dolares',         label: 'Todos los Dólares',  esLista: true  },
      { id: 'oficial',         label: 'Dólar Oficial',      esLista: false },
      { id: 'blue',            label: 'Dólar Blue',         esLista: false },
      { id: 'bolsa',           label: 'Dólar Bolsa (MEP)', esLista: false },
      { id: 'contadoconliqui', label: 'Dólar CCL',          esLista: false },
      { id: 'tarjeta',         label: 'Dólar Tarjeta',      esLista: false },
      { id: 'mayorista',       label: 'Dólar Mayorista',    esLista: false },
      { id: 'cripto',          label: 'Dólar Cripto',       esLista: false },
      { id: 'cotizaciones',    label: 'Otras Monedas',      esLista: true  },
    ],
  },
  chile: {
    nombre: 'Chile', bandera: '🇨🇱', moneda: 'CLP',
    endpoints: [
      { id: 'cotizaciones', label: 'Todas las Cotizaciones', esLista: true  },
      { id: 'dolar',        label: 'Dólar USD',              esLista: false },
      { id: 'euro',         label: 'Euro',                   esLista: false },
      { id: 'real',         label: 'Real Brasileño',         esLista: false },
      { id: 'peso_arg',     label: 'Peso Argentino',         esLista: false },
      { id: 'peso_uru',     label: 'Peso Uruguayo',          esLista: false },
    ],
  },
  venezuela: {
    nombre: 'Venezuela', bandera: '🇻🇪', moneda: 'VES',
    endpoints: [
      { id: 'dolares',  label: 'Todos los Dólares',  esLista: true  },
      { id: 'oficial',  label: 'Dólar Oficial (BCV)', esLista: false },
      { id: 'paralelo', label: 'Dólar Paralelo',      esLista: false },
      { id: 'euros',    label: 'Todos los Euros',     esLista: true  },
      { id: 'euro_of',  label: 'Euro Oficial',        esLista: false },
      { id: 'euro_par', label: 'Euro Paralelo',       esLista: false },
    ],
  },
  colombia: {
    nombre: 'Colombia', bandera: '🇨🇴', moneda: 'COP',
    endpoints: [
      { id: 'cotizaciones', label: 'Todas las Cotizaciones', esLista: true  },
      { id: 'dolar',        label: 'Dólar USD',              esLista: false },
      { id: 'euro',         label: 'Euro',                   esLista: false },
      { id: 'real',         label: 'Real Brasileño',         esLista: false },
      { id: 'peso_mx',      label: 'Peso Mexicano',          esLista: false },
      { id: 'peso_cl',      label: 'Peso Chileno',           esLista: false },
      { id: 'peso_arg',     label: 'Peso Argentino',         esLista: false },
      { id: 'sol',          label: 'Sol Peruano',            esLista: false },
    ],
  },
  mexico: {
  nombre: 'México',
  bandera: '🇲🇽',
  moneda: 'MXN',
  baseUrl: 'https://mx.dolarapi.com',
  endpoints: [
    { id: 'dolar',     path: '/virtual/usd', label: 'Dólar USD',      esPrincipal: true,  esLista: false },
    { id: 'euro',      path: '/virtual/eur', label: 'Euro',           esPrincipal: false, esLista: false },
    { id: 'real',      path: '/virtual/brl', label: 'Real Brasileño', esPrincipal: false, esLista: false },
    { id: 'peso_arg',  path: '/virtual/ars', label: 'Peso Argentino', esPrincipal: false, esLista: false },
    { id: 'peso_uru',  path: '/virtual/uyu', label: 'Peso Uruguayo',  esPrincipal: false, esLista: false },
    { id: 'libra',     path: '/virtual/gbp', label: 'Libra Esterlina',esPrincipal: false, esLista: false }
  ]
},
  uruguay: {
    nombre: 'Uruguay', bandera: '🇺🇾', moneda: 'UYU',
    endpoints: [
      { id: 'cotizaciones', label: 'Todas las Cotizaciones', esLista: true  },
      { id: 'dolar',        label: 'Dólar USD',              esLista: false },
      { id: 'euro',         label: 'Euro',                   esLista: false },
      { id: 'peso_arg',     label: 'Peso Argentino',         esLista: false },
      { id: 'real',         label: 'Real Brasileño',         esLista: false },
      { id: 'libra',        label: 'Libra Esterlina',        esLista: false },
    ],
  },
  bolivia: {
    nombre: 'Bolivia', bandera: '🇧🇴', moneda: 'BOB',
    endpoints: [
      { id: 'oficial', label: 'Dólar Oficial',  esLista: false },
      { id: 'binance', label: 'Dólar Binance',  esLista: false },
    ],
  },
  brasil: {
    nombre: 'Brasil', bandera: '🇧🇷', moneda: 'BRL',
    endpoints: [
      { id: 'cotizaciones', label: 'Todas las Cotizaciones', esLista: true  },
      { id: 'dolar',        label: 'Dólar USD',              esLista: false },
      { id: 'euro',         label: 'Euro',                   esLista: false },
      { id: 'peso_arg',     label: 'Peso Argentino',         esLista: false },
      { id: 'peso_cl',      label: 'Peso Chileno',           esLista: false },
      { id: 'peso_uru',     label: 'Peso Uruguayo',          esLista: false },
    ],
  },
};

// ─── Utils ────────────────────────────────────────────────
/* =========================================================
FUNCIÓN DE FORMATEO

Convierte números a formato monetario legible para el
usuario utilizando configuración regional española.

Ejemplo:
4567.89 -> 4.567,89
========================================================= */
const fmt = n => n != null ? Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '–';

/* =========================================================
ATAJOS PARA MANIPULACIÓN DEL DOM

$ -> Selecciona un elemento
$$ -> Selecciona múltiples elementos

Reducen la cantidad de código repetitivo.
========================================================= */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* =========================================================
OBTENER HORA ACTUAL

Utilizada para mostrar la última actualización de las
cotizaciones obtenidas desde la API.
========================================================= */

const now = () => new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

// Extrae compra/venta de un objeto cotización de cualquier país
/* =========================================================
NORMALIZACIÓN DE PRECIOS

Diferentes APIs devuelven nombres distintos para los
precios.

Esta función transforma cualquier estructura en un
formato estándar:

{
compra,
venta
}

Permite que el resto del sistema trabaje siempre con
los mismos nombres.
========================================================= */
function extractPrices(q) {
  const compra =
    q.compra ??
    q.precio ??
    q.valor ??
    q.promedio ??
    q.buy ??
    q.price ??
    null;

  const venta =
    q.venta ??
    q.sell ??
    q.precioVenta ??
    q.price_sell ??
    null;

  return { compra, venta };
}

// Extrae el nombre legible de una cotización
/* =========================================================
OBTENER NOMBRE DE UNA COTIZACIÓN

Extrae el nombre independientemente de cómo venga
definido en la respuesta de la API.
========================================================= */
function extractName(q) {
  return q.nombre ?? q.moneda ?? q.name ?? q.casa ?? q.tipo ?? 'Cotización';
}

// Normaliza la respuesta de la API a un array
/* =========================================================
NORMALIZAR RESPUESTA DE LA API

Algunas APIs devuelven arrays y otras objetos.

Esta función garantiza que el resultado siempre sea
un arreglo para poder recorrerlo sin errores.
========================================================= */
function toArray(data) {
  if (!data) return [];

  // si ya es array
  if (Array.isArray(data)) return data;

  // si es objeto con lista dentro
  if (typeof data === 'object') {
    // intenta detectar arrays comunes en APIs latinoamericanas
    if (Array.isArray(data.dolares)) return data.dolares;
    if (Array.isArray(data.cotizaciones)) return data.cotizaciones;
    if (Array.isArray(data.monedas)) return data.monedas;
    if (Array.isArray(data.resultados)) return data.resultados;

    // fallback: convertir objeto único a array
    return [data];
  }

  return [];
}

// ─── Navegación ───────────────────────────────────────────
/* =========================================================
NAVEGACIÓN PRINCIPAL

Controla el cambio entre vistas:

Dashboard
Conversor
API Explorer

Activa y desactiva secciones dinámicamente sin recargar
la página.
========================================================= */

$$('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    $$('.view').forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    $(`#view-${view}`).classList.add('active');
    if (view === 'api') renderApiExplorer();
    if (view === 'conversor') loadConversorQuotes();
  });
});

// ─── Selector de país ─────────────────────────────────────
/* =========================================================
SELECTOR DE PAÍS

Permite cambiar entre países disponibles.

Al seleccionar uno:

Actualiza el estado global.
Regenera los endpoints.
Consulta nuevas cotizaciones.
========================================================= */
$$('.country-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    $$('.country-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.country = pill.dataset.country;
    state.activeEndpoint = null;
    renderEndpointTabs(state.country);
    loadEndpoint(state.country, null); // null = usar el principal
  });
});

// ─── Tabs de endpoints ────────────────────────────────────
/* =========================================================
GENERACIÓN DE TABS DE ENDPOINTS

Construye dinámicamente las pestañas según los
endpoints configurados para cada país.

También valida que el endpoint exista antes de realizar
una consulta al backend.
========================================================= */
function renderEndpointTabs(country) {
  const meta = PAISES_META[country];
  if (!meta || meta.endpoints.length <= 1) {
    $('#endpointTabsWrap').style.display = 'none';
    return;
  }
  $('#endpointTabsWrap').style.display = 'block';
  $('#endpointTabs').innerHTML = meta.endpoints.map(ep => `
    <button class="ep-tab${state.activeEndpoint === ep.id ? ' active' : ''}" data-ep="${ep.id}">
      ${ep.label}
    </button>`).join('');

  $$('.ep-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.ep-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const epId = tab.getAttribute('data-ep');

console.log('CLICK EP:', epId);

if (!epId) {
  console.warn('Endpoint vacío detectado');
  return;
}

// validar existencia REAL
const exists = PAISES_META[state.country].endpoints.some(e => e.id === epId);

if (!exists) {
  console.warn('Endpoint no existe en config:', epId);
  return;
}

state.activeEndpoint = epId;
loadEndpoint(state.country, epId);

    });
  });
}

// ─── Cargar endpoint ──────────────────────────────────────
/* =========================================================
CARGA DE DATOS PRINCIPAL

Es la función más importante del sistema.

Responsabilidades:

Mostrar loaders
Consultar la API
Procesar respuestas
Manejar errores
Actualizar la interfaz

Todo el flujo de datos pasa por esta función.
========================================================= */
async function loadEndpoint(country, endpointId) {
  renderHeroSkeleton();
  renderGridSkeleton();

  try {
    let url, data, meta;
    if (!endpointId) {
      // realiza peticion y hace  un obj js
      const res = await fetch(`${API}/${country}/cotizaciones`);
      meta = await res.json();
      if (meta.error) throw new Error(meta.error);
      data = meta.data;
    } else {
      const res = await fetch(`${API}/${country}/endpoint/${endpointId}`);
       meta = await res.json();

        if (!res.ok) {
         console.error('Backend error:', meta);
         throw new Error(meta.error || 'Error desconocido');
         }
         if (meta.error) {
            throw new Error(meta.error);
          }
      data = meta.data;
    }

    const paisMeta = PAISES_META[country];
    // organiza,mismo formato/*
    const quotes = toArray(data);
    const epMeta = endpointId ? paisMeta.endpoints.find(e => e.id === endpointId) : paisMeta.endpoints[0];
    const label = epMeta ? epMeta.label : 'Cotización';

    // muestra en la pagina /*
    renderHero(quotes, meta.bandera, meta.pais, meta.moneda, label);
    renderGrid(quotes, meta.moneda, label);
    $('#lastUpdate').textContent = now();
    setStatus('ok', 'En línea');
  } catch (err) {
    $('#heroCard').innerHTML = `<div class="error-msg">⚠ ${err.message}</div>`;
    $('#quotesGrid').innerHTML = '';
    setStatus('error', 'Error');
  }
}

// ─── HERO ─────────────────────────────────────────────────
/* =========================================================
HERO SKELETON

Loader mostrado mientras llegan los datos desde la API.
Mejora la experiencia de usuario.
========================================================= */
function renderHeroSkeleton() {
  $('#heroCard').innerHTML = `<div class="hero-loader"><div class="spinner"></div></div>`;
}


/* =========================================================
HERO PRINCIPAL

Muestra la cotización destacada:

Nombre
País
Bandera
Compra
Venta
Spread

Es la tarjeta principal del dashboard.
========================================================= */
function renderHero(quotes, bandera, pais, moneda, label) {
  const main = quotes.find(q => { const {compra} = extractPrices(q); return compra != null; }) || quotes[0];
  if (!main) {
    $('#heroCard').innerHTML = `<div class="error-msg">⚠ Sin datos disponibles</div>`;
    return;
  }
  const nombre = extractName(main);
  const { compra, venta } = extractPrices(main);

  $('#heroCard').innerHTML = `
    <div class="hero-content">
      <div class="hero-left">
        <div class="hero-eyebrow">Cotización ${label}</div>
        <div class="hero-name">${nombre}</div>
        <div class="hero-meta">
          <span>${bandera} ${pais}</span>
          <span class="hero-badge">${moneda}</span>
          ${quotes.length > 1 ? `<span class="hero-badge">${quotes.length} cotizaciones</span>` : ''}
        </div>
      </div>
      <div class="hero-right">
        ${venta != null ? `
          <div class="hero-price-label">Venta</div>
          <div class="hero-price">${fmt(venta)}</div>
          <div class="hero-prices">
            <div class="hero-sub"><span class="label">Compra</span><span class="val">${fmt(compra)}</span></div>
            <div class="hero-sub"><span class="label">Spread</span><span class="val">${compra && venta ? fmt(venta - compra) : '–'}</span></div>
          </div>
        ` : `
          <div class="hero-price-label">Precio</div>
          <div class="hero-price">${fmt(compra)}</div>
        `}
      </div>
    </div>`;
}

// ─── GRID ─────────────────────────────────────────────────
/* =========================================================
GRID SKELETON

Tarjetas temporales mostradas mientras se cargan las
cotizaciones.
========================================================= */
function renderGridSkeleton() {
  $('#quotesGrid').innerHTML = Array(4).fill(`
    <div class="quote-card">
      <div class="skeleton" style="width:55%;height:9px;margin-bottom:7px;"></div>
      <div class="skeleton" style="width:75%;height:13px;margin-bottom:12px;"></div>
      <div style="display:flex;justify-content:space-between;">
        <div class="skeleton" style="width:42%;height:20px;"></div>
        <div class="skeleton" style="width:42%;height:20px;"></div>
      </div>
    </div>`).join('');
}


/* =========================================================
GRID DE COTIZACIONES

Genera dinámicamente todas las tarjetas de monedas.

Soporta:

Compra y venta
Cotizaciones de precio único
========================================================= */
function renderGrid(quotes, moneda, label) {
  $('#gridLabel').textContent = label || 'Cotizaciones';
  if (!quotes || quotes.length === 0) {
    $('#quotesGrid').innerHTML = `<p style="color:var(--text-2);font-size:13px;grid-column:1/-1;">Sin cotizaciones disponibles.</p>`;
    return;
  }

  $('#quotesGrid').innerHTML = quotes.map(q => {
    const nombre = extractName(q);
    const { compra, venta } = extractPrices(q);
    const tipo = q.moneda || moneda || '';

    if (venta != null) {
      return `
        <div class="quote-card">
          <div class="qc-type">${tipo}</div>
          <div class="qc-name">${nombre}</div>
          <div class="qc-prices">
            <div class="qc-buy"><span class="p-label">Compra</span><span class="p-val">${fmt(compra)}</span></div>
            <div class="qc-sell"><span class="p-label">Venta</span><span class="p-val">${fmt(venta)}</span></div>
          </div>
          <div class="qc-spread"></div>
        </div>`;

    } else {
      return `
        <div class="quote-card single-price">
          <div class="qc-type">${tipo}</div>
          <div class="qc-name">${nombre}</div>
          <div class="qc-main"><span class="p-label">Precio</span><span class="p-val">${fmt(compra)}</span></div>
        </div>`;
    }
  }).join('');
}

// ─── TICKER ──────────────────────────────────────────────
/* =========================================================
TICKER DE COTIZACIONES

Barra informativa animada ubicada en la parte inferior.

Muestra las principales cotizaciones en tiempo real.
========================================================= */
async function loadTicker() {
  try {
    const res = await fetch(`${API}/argentina/cotizaciones`);
    const json = await res.json();
    const quotes = toArray(json.data).filter(q => extractPrices(q).compra != null).slice(0, 8);
    if (!quotes.length) return;

    const build = quotes.map(q => {
      const nombre = extractName(q);
      const { compra, venta } = extractPrices(q);
      return `
        <span class="ticker-item">
          <span>🇦🇷</span>
          <span class="t-name">${nombre}</span>
          ${compra != null ? `<span class="t-buy">↑ ${fmt(compra)}</span>` : ''}
          ${venta  != null ? `<span class="t-sell">↓ ${fmt(venta)}</span>` : ''}
        </span>
        <span class="ticker-sep">·</span>`;
    }).join('');
    $('#ticker').innerHTML = build + build; // doble para loop
  } catch { /* silencioso */ }
}

// ─── STATUS ───────────────────────────────────────────────
/* =========================================================
INDICADOR DE ESTADO

Actualiza visualmente el estado de conexión:

Conectando
En línea
Error
========================================================= */
function setStatus(type, text) {
  $('#statusDot').className = `status-dot ${type}`;
  $('#statusText').textContent = text;
}


/* =========================================================
BOTÓN DE ACTUALIZACIÓN MANUAL

Fuerza la recarga de datos sin esperar la actualización
automática.
========================================================= */
// detecta lo q hace el us/*
$('#refreshBtn').addEventListener('click', () => {
  loadEndpoint(state.country, state.activeEndpoint);
  loadTicker();
});

// ─── CONVERSOR ────────────────────────────────────────────
/* =========================================================
CARGA DE COTIZACIONES DEL CONVERSOR

Obtiene las monedas disponibles para realizar
conversiones.
========================================================= */
async function loadConversorQuotes() {
  const country = $('#convCountry').value;
  const sel = $('#convType');
  sel.innerHTML = '<option>Cargando…</option>';

  try {
    // se encarga de iniciar/*
    const res = await fetch(`${API}/${country}/cotizaciones`);
    const json = await res.json();
    const quotes = toArray(json.data).filter(q => extractPrices(q).compra != null);
    state.convQuotes = quotes;
    sel.innerHTML = quotes.map((q, i) => {
      const nombre = extractName(q);
      return `<option value="${i}">${nombre}</option>`;
    }).join('');
  } catch {
    sel.innerHTML = '<option>Error al cargar</option>';
  }
}

$('#convCountry').addEventListener('change', loadConversorQuotes);
$('#toggleUsdToLocal').addEventListener('click', () => {
  state.convDirection = 'usd-to-local';
  /* =========================================================
CONTROL DE DIRECCIÓN DE CONVERSIÓN

usd-to-local -> USD hacia moneda local
local-to-usd -> Moneda local hacia USD
========================================================= */
  $('#toggleUsdToLocal').classList.add('active');
  $('#toggleLocalToUsd').classList.remove('active');
});
$('#toggleLocalToUsd').addEventListener('click', () => {
  state.convDirection = 'local-to-usd';
  $('#toggleLocalToUsd').classList.add('active');
  $('#toggleUsdToLocal').classList.remove('active');
});

// Conversión en tiempo real en "API"
/* =========================================================
MOTOR DE CONVERSIÓN

Flujo:

Obtiene monto ingresado
Obtiene tasa seleccionada
Envía datos al backend
Recibe resultado
Muestra conversión final

La operación matemática se realiza en el servidor.
========================================================= */
  $('#calcBtn').addEventListener('click', async () => {

  const amount = parseFloat($('#convAmount').value);

  const idx = parseInt($('#convType').value);

  const q = state.convQuotes[idx];

  if (!q || isNaN(amount)) return;

  const { compra, venta } = extractPrices(q);

  const tasaVenta = venta ?? compra;
  const tasaCompra = compra ?? venta;

  const tasa =
    state.convDirection === 'usd-to-local'
      ? tasaVenta
      : tasaCompra;

  try {

    const response = await fetch('/api/convertir', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        monto: amount,
        tasa: tasa,
        direccion: state.convDirection
      })

    });

    const data = await response.json();

    $('#convResult').style.display = 'block';

    $('#convResult').innerHTML = `
      <div class="result-value">
        ${fmt(data.resultado)}
      </div>
    `;

  } catch (error) {

    console.error(error);

    $('#convResult').innerHTML = `
      <div class="error-msg">
        Error al convertir
      </div>
    `;

  }

});

// ─── API EXPLORER ─────────────────────────────────────────
/* =========================================================
EXPLORADOR DE API

Permite visualizar y probar todos los endpoints
disponibles desde la interfaz.

Funciona como una mini herramienta de documentación
interactiva.
========================================================= */
function renderApiExplorer() {
  // Filtros de país
  const filterEl = $('#apiCountryFilter');
  filterEl.innerHTML = `<button class="api-filter-btn active" data-f="all">Todos</button>` +
    Object.entries(PAISES_META).map(([id, p]) =>
      `<button class="api-filter-btn" data-f="${id}">${p.bandera} ${p.nombre}</button>`
    ).join('');

  $$('.api-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.api-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.apiFilterCountry = btn.dataset.f;
      renderApiEndpoints();
    });
  });

  renderApiEndpoints();
}


/* =========================================================
GENERADOR DE ENDPOINTS

Construye automáticamente la lista de rutas API para
cada país.

Facilita las pruebas y validaciones.
========================================================= */
function renderApiEndpoints() {
  const filter = state.apiFilterCountry;

  // Construir lista de todos los endpoints
  const items = [];
  Object.entries(PAISES_META).forEach(([countryId, p]) => {
    if (filter !== 'all' && filter !== countryId) return;
    // Endpoint de cotizaciones principales
    items.push({ country: countryId, bandera: p.bandera, epId: null, label: 'Cotizaciones principales', path: `/api/${countryId}/cotizaciones` });
    // Endpoints individuales
    p.endpoints.forEach(ep => {
      items.push({ country: countryId, bandera: p.bandera, epId: ep.id, label: ep.label, path: `/api/${countryId}/endpoint/${ep.id}` });
    });
  });

  $('#endpointList').innerHTML = items.map((item, i) => `
    <div class="ep-item" data-idx="${i}">
      <span class="ep-method">GET</span>
      <span class="ep-country">${item.bandera}</span>
      <span class="ep-path">${item.path}</span>
      <span class="ep-desc">${item.label}</span>
    </div>`).join('');

  $$('.ep-item').forEach(el => {
    el.addEventListener('click', async () => {
      const item = items[el.dataset.idx];
      el.classList.add('loading');
      $('#apiResponsePre').textContent = '⟳ Cargando…';
      $('#respLabel').textContent = `${item.bandera} ${item.label}`;
      try {
        const res = await fetch(item.path);
        const json = await res.json();
        $('#apiResponsePre').innerHTML = syntaxHighlight(JSON.stringify(json, null, 2));
      } catch (err) {
        $('#apiResponsePre').textContent = `Error: ${err.message}`;
      } finally {
        el.classList.remove('loading');
      }
    });
  });
}

/* =========================================================
RESALTADO DE JSON

Agrega estilos visuales al JSON recibido para mejorar
la lectura:

Claves
Strings
Números
Booleanos
Null

Similar a herramientas como Postman.
========================================================= */
function syntaxHighlight(json) {
  return json
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/("(\\u[\dA-Fa-f]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
      let cls = 'json-number';
      if (/^"/.test(match)) cls = /:$/.test(match) ? 'json-key' : 'json-string';
      else if (/true|false/.test(match)) cls = 'json-bool';
      else if (/null/.test(match)) cls = 'json-null';
      return `<span class="${cls}">${match}</span>`;
    });
}


/* =========================================================
COPIAR RESPUESTA

Copia el JSON mostrado al portapapeles para facilitar
pruebas y depuración.
========================================================= */
$('#copyBtn').addEventListener('click', () => {
  navigator.clipboard.writeText($('#apiResponsePre').textContent).then(() => {
    $('#copyBtn').textContent = '✓ Copiado';
    setTimeout(() => $('#copyBtn').textContent = 'Copiar', 1500);
  });
});

// ─── INIT ─────────────────────────────────────────────────
/* =========================================================
INICIALIZACIÓN DEL SISTEMA

Punto de entrada principal.

Al iniciar:

Establece conexión
Carga Argentina por defecto
Carga ticker
Carga conversor
Programa actualización automática cada 2 minutos

Equivale al "main()" de la aplicación.
========================================================= */
// se encarga de iniciar/*
(async function init() {
  // conectada/*
  setStatus('', 'Conectando…');
  // crea endp/*
  renderEndpointTabs('argentina');
  await Promise.all([
    // consulta/*
    loadEndpoint('argentina', null),
    loadTicker(),
  ]);
  loadConversorQuotes();
  setInterval(() => {
    loadEndpoint(state.country, state.activeEndpoint);
    loadTicker();
  }, 120_000);
})();