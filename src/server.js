/* =========================================================
DOLARAPI APP - BACKEND PRINCIPAL

Este servidor actúa como intermediario entre el frontend
y las APIs externas de cotizaciones.

Responsabilidades:

Recibir peticiones HTTP
Consultar APIs externas
Procesar respuestas
Realizar conversiones monetarias
Entregar datos al frontend
========================================================= */

/* =========================================================
IMPORTACIÓN DE DEPENDENCIAS

express -> Framework web para Node.js
node-fetch -> Realiza peticiones HTTP externas
cors -> Permite comunicación entre dominios
path -> Manejo seguro de rutas del sistema

========================================================= */
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

/* =========================================================
CREACIÓN DEL SERVIDOR

Inicializa Express y define el puerto donde escuchará
las solicitudes del cliente.
========================================================= */
const app = express();
const PORT = process.env.PORT || 3001;

/* =========================================================
CONSULTA DE TASAS DE CAMBIO INTERNACIONALES

Consume la API Exchange Rates.

Esta función se utiliza para países que presentan
problemas con DolarAPI o que requieren tasas
internacionales más estables.

Retorna un objeto con todas las tasas disponibles.
========================================================= */
async function fetchExchangeRates() {
  const res = await fetch('https://open.er-api.com/v6/latest/USD');

  if (!res.ok) {
    throw new Error(`Exchange API HTTP ${res.status}`);
  }

  const json = await res.json();

  if (!json.rates) {
    throw new Error('No se recibieron tasas de cambio');
  }

  return json.rates;
}

/* =========================================================
CONFIGURACIÓN DE MIDDLEWARES

cors()
Permite que el frontend pueda comunicarse con el backend.

express.json()
Permite recibir datos JSON enviados desde formularios
o peticiones POST.
========================================================= */
app.use(cors());
app.use(express.json());

/* =========================================================
LOGGER DE PETICIONES

Registra en consola:

Hora
Método HTTP
Ruta solicitada

Muy útil para depuración y monitoreo.
========================================================= */

app.use((req, res, next) => {

  console.log(
    `[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`
  );

  next();

});

/* =========================================================
ARCHIVOS ESTÁTICOS

Permite servir automáticamente:

index.html
CSS
JavaScript
Imágenes

ubicados en la carpeta public.
========================================================= */
app.use(express.static(path.join(__dirname, '../public')));

// ─── Configuración completa de países con sus BASE URLs y endpoints reales ────
/* =========================================================
CONFIGURACIÓN DE PAÍSES

Base de datos interna del sistema.

Cada país contiene:

Nombre
Bandera
Moneda oficial
URL base de la API
Endpoints disponibles

Gracias a esta estructura se pueden agregar nuevos
países fácilmente.
========================================================= */
const PAISES = {
  
  argentina: {
    nombre: 'Argentina', bandera: '🇦🇷', moneda: 'ARS',
    baseUrl: 'https://dolarapi.com',
    endpoints: [
      { id: 'dolares',          path: '/v1/dolares',                    label: 'Todos los Dólares',  esPrincipal: true,  esLista: true  },
      { id: 'oficial',          path: '/v1/dolares/oficial',            label: 'Dólar Oficial',      esPrincipal: false, esLista: false },
      { id: 'blue',             path: '/v1/dolares/blue',               label: 'Dólar Blue',         esPrincipal: false, esLista: false },
      { id: 'bolsa',            path: '/v1/dolares/bolsa',              label: 'Dólar Bolsa (MEP)',  esPrincipal: false, esLista: false },
      { id: 'contadoconliqui',  path: '/v1/dolares/contadoconliqui',   label: 'Dólar CCL',          esPrincipal: false, esLista: false },
      { id: 'tarjeta',          path: '/v1/dolares/tarjeta',            label: 'Dólar Tarjeta',      esPrincipal: false, esLista: false },
      { id: 'mayorista',        path: '/v1/dolares/mayorista',          label: 'Dólar Mayorista',    esPrincipal: false, esLista: false },
      { id: 'cripto',           path: '/v1/dolares/cripto',             label: 'Dólar Cripto',       esPrincipal: false, esLista: false },
      { id: 'cotizaciones',     path: '/v1/cotizaciones',               label: 'Otras Monedas',      esPrincipal: false, esLista: true  },
    ],
  },
  chile: {
    nombre: 'Chile', bandera: '🇨🇱', moneda: 'CLP',
    baseUrl: 'https://cl.dolarapi.com',
    endpoints: [
      { id: 'cotizaciones', path: '/v1/cotizaciones', label: 'Todas las Cotizaciones', esPrincipal: true,  esLista: true  },
      { id: 'dolar',        path: '/v1/monedas/usd',  label: 'Dólar USD',              esPrincipal: false, esLista: false },
      { id: 'euro',         path: '/v1/monedas/eur',  label: 'Euro',                   esPrincipal: false, esLista: false },
      { id: 'real',         path: '/v1/monedas/brl',  label: 'Real Brasileño',         esPrincipal: false, esLista: false },
      { id: 'peso_arg',     path: '/v1/monedas/ars',  label: 'Peso Argentino',         esPrincipal: false, esLista: false },
      { id: 'peso_uru',     path: '/v1/monedas/uyu',  label: 'Peso Uruguayo',          esPrincipal: false, esLista: false },
    ],
  },
  venezuela: {
    nombre: 'Venezuela', bandera: '🇻🇪', moneda: 'VES',
    baseUrl: 'https://ve.dolarapi.com',
    endpoints: [
      { id: 'dolares',    path: '/v1/dolares',           label: 'Todos los Dólares', esPrincipal: true,  esLista: true  },
      { id: 'oficial',    path: '/v1/dolares/oficial',   label: 'Dólar Oficial (BCV)', esPrincipal: false, esLista: false },
      { id: 'paralelo',   path: '/v1/dolares/paralelo',  label: 'Dólar Paralelo',    esPrincipal: false, esLista: false },
      { id: 'euros',      path: '/v1/euros',             label: 'Todos los Euros',   esPrincipal: false, esLista: true  },
      { id: 'euro_of',    path: '/v1/euros/oficial',     label: 'Euro Oficial',      esPrincipal: false, esLista: false },
      { id: 'euro_par',   path: '/v1/euros/paralelo',    label: 'Euro Paralelo',     esPrincipal: false, esLista: false },
    ],
  },
  colombia: {
    nombre: 'Colombia', bandera: '🇨🇴', moneda: 'COP',
    baseUrl: 'https://co.dolarapi.com',
    endpoints: [
      { id: 'cotizaciones', path: '/v1/cotizaciones', label: 'Todas las Cotizaciones', esPrincipal: true,  esLista: true  },
      { id: 'dolar',        path: '/v1/monedas/usd',  label: 'Dólar USD',              esPrincipal: false, esLista: false },
      { id: 'euro',         path: '/v1/monedas/eur',  label: 'Euro',                   esPrincipal: false, esLista: false },
      { id: 'real',         path: '/v1/monedas/brl',  label: 'Real Brasileño',         esPrincipal: false, esLista: false },
      { id: 'peso_mx',      path: '/v1/monedas/mxn',  label: 'Peso Mexicano',          esPrincipal: false, esLista: false },
      { id: 'peso_cl',      path: '/v1/monedas/clp',  label: 'Peso Chileno',           esPrincipal: false, esLista: false },
      { id: 'peso_arg',     path: '/v1/monedas/ars',  label: 'Peso Argentino',         esPrincipal: false, esLista: false },
      { id: 'sol',          path: '/v1/monedas/pen',  label: 'Sol Peruano',            esPrincipal: false, esLista: false },
    ],
  },
  mexico: {
    nombre: 'México', bandera: '🇲🇽', moneda: 'MXN',
    baseUrl: 'https://mx.dolarapi.com',
    endpoints: [
      { id: 'dolar', path: '/v1/monedas/usd', label: 'Dólar USD', esPrincipal: true, esLista: false },
    ],
  },
  uruguay: {
    nombre: 'Uruguay', bandera: '🇺🇾', moneda: 'UYU',
    baseUrl: 'https://uy.dolarapi.com',
    endpoints: [
      { id: 'cotizaciones', path: '/v1/cotizaciones', label: 'Todas las Cotizaciones', esPrincipal: true,  esLista: true  },
      { id: 'dolar',        path: '/v1/monedas/usd',  label: 'Dólar USD',              esPrincipal: false, esLista: false },
      { id: 'euro',         path: '/v1/monedas/eur',  label: 'Euro',                   esPrincipal: false, esLista: false },
      { id: 'peso_arg',     path: '/v1/monedas/ars',  label: 'Peso Argentino',         esPrincipal: false, esLista: false },
      { id: 'real',         path: '/v1/monedas/brl',  label: 'Real Brasileño',         esPrincipal: false, esLista: false },
      { id: 'libra',        path: '/v1/monedas/gbp',  label: 'Libra Esterlina',        esPrincipal: false, esLista: false },
    ],
  },
  bolivia: {
    nombre: 'Bolivia', bandera: '🇧🇴', moneda: 'BOB',
    baseUrl: 'https://bo.dolarapi.com',
    endpoints: [
      { id: 'oficial',  path: '/v1/dolares/oficial',  label: 'Dólar Oficial',  esPrincipal: true,  esLista: false },
      { id: 'binance',  path: '/v1/dolares/binance',  label: 'Dólar Binance',  esPrincipal: false, esLista: false },
    ],
  },
  brasil: {
    nombre: 'Brasil', bandera: '🇧🇷', moneda: 'BRL',
    baseUrl: 'https://br.dolarapi.com',
    endpoints: [
      { id: 'cotizaciones', path: '/v1/cotacoes',      label: 'Todas las Cotizaciones', esPrincipal: true,  esLista: true  },
      { id: 'dolar',        path: '/v1/moedas/usd',    label: 'Dólar USD',              esPrincipal: false, esLista: false },
      { id: 'euro',         path: '/v1/moedas/eur',    label: 'Euro',                   esPrincipal: false, esLista: false },
      { id: 'peso_arg',     path: '/v1/moedas/ars',    label: 'Peso Argentino',         esPrincipal: false, esLista: false },
      { id: 'peso_cl',      path: '/v1/moedas/clp',    label: 'Peso Chileno',           esPrincipal: false, esLista: false },
      { id: 'peso_uru',     path: '/v1/moedas/uyu',    label: 'Peso Uruguayo',          esPrincipal: false, esLista: false },
    ],
    
  },
  
};
// Se le dice a la API que para estos países, en lugar de consultar sus endpoints, se consulte la API de Exchange Rates
/* =========================================================
PAÍSES QUE UTILIZAN EXCHANGE RATES

Estos países no consumen directamente DolarAPI.

En su lugar utilizan la API internacional de tasas
de cambio para garantizar disponibilidad y estabilidad.
========================================================= */
const EXCHANGE_COUNTRIES = {
  chile: 'CLP',
  colombia: 'COP',
  mexico: 'MXN',
  uruguay: 'UYU',
  bolivia: 'BOB',
  brasil: 'BRL'
};

/* =========================================================
FUNCIÓN GENÉRICA DE CONSULTA

Construye una URL completa y realiza la petición
HTTP correspondiente.

Responsabilidades:

Crear URL
Consultar API
Verificar errores
Devolver JSON procesado

Centraliza toda la comunicación externa.
========================================================= */
async function fetchApi(baseUrl, path) {
    const url = `${baseUrl}${path}`;

    console.log('URL CONSULTADA:', url);

    const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        timeout: 8000
    });

    console.log('STATUS:', res.status);

    if (!res.ok) {
        const txt = await res.text();
        console.log('ERROR API:', txt);
        throw new Error(`HTTP ${res.status}`);
    }

    return res.json();
}

// Info de países
/* =========================================================
ENDPOINT: LISTA DE PAÍSES

GET /api/paises

Devuelve todos los países disponibles junto con
sus endpoints configurados.

Utilizado por el frontend para construir menús
y filtros dinámicamente.
========================================================= */
app.get('/api/paises', (req, res) => {
  const lista = Object.entries(PAISES).map(([id, p]) => ({
    id, nombre: p.nombre, bandera: p.bandera, moneda: p.moneda,
    endpoints: p.endpoints.map(e => ({ id: e.id, label: e.label, path: e.path })),
  }));
  res.json(lista);
});

// Cotizaciones principales de un país (endpoint principal)
/* =========================================================
ENDPOINT: COTIZACIONES PRINCIPALES

GET /api//cotizaciones

Obtiene la cotización principal de un país.

Flujo:

Verifica que el país exista.
Determina qué API utilizar.
Consulta datos externos.
Devuelve información al frontend.
========================================================= */
app.get('/api/:pais/cotizaciones', async (req, res) => {
  const { pais } = req.params;

  const info = PAISES[pais];

  if (!info) {
    return res.status(404).json({
      error: `País "${pais}" no encontrado`
    });
  }

  // Chile, Colombia, México, Uruguay, Bolivia y Brasil
  /* =========================================================
BLOQUE ESPECIAL PARA EXCHANGE RATES

Se ejecuta únicamente para:

Chile
Colombia
México
Uruguay
Bolivia
Brasil

Convierte las tasas recibidas en un formato compatible
con el frontend.
========================================================= */
  if (EXCHANGE_COUNTRIES[pais]) {
    try {
      const rates = await fetchExchangeRates();

const monedas = [
  { codigo: 'USD', nombre: 'Dólar USD' },
  { codigo: 'EUR', nombre: 'Euro' },
  { codigo: 'BRL', nombre: 'Real Brasileño' },
  { codigo: 'ARS', nombre: 'Peso Argentino' },
  { codigo: 'MXN', nombre: 'Peso Mexicano' },
  { codigo: 'UYU', nombre: 'Peso Uruguayo' }
];

const data = monedas
  .filter(m => rates[m.codigo])
  .map(m => ({
    moneda: m.codigo,
    nombre: m.nombre,
    compra: Number(rates[m.codigo].toFixed(2)),
    venta: Number(rates[m.codigo].toFixed(2))
  }));

return res.json({
  pais: info.nombre,
  bandera: info.bandera,
  moneda: info.moneda,
  data
});

    } catch (err) {
      return res.status(500).json({
        error: err.message
      });
    }
  }

  // Argentina y Venezuela
  /* =========================================================
BLOQUE PARA DOLARAPI

Utilizado principalmente por:

Argentina
Venezuela

Consulta directamente los endpoints configurados
dentro de la estructura PAISES.
========================================================= */
  try {
    const principal =
      info.endpoints.find(e => e.esPrincipal) ||
      info.endpoints[0];

    const data = await fetchApi(
      info.baseUrl,
      principal.path
    );

    res.json({
      pais: info.nombre,
      bandera: info.bandera,
      moneda: info.moneda,
      data
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

//Cambio de api para chile, colombia, mexico, uruguay, bolivia y brasil
// Endpoint específico de un país
/* =========================================================
ENDPOINT ESPECÍFICO

GET /api//endpoint/

Permite consultar una moneda específica.

Ejemplos:

/api/argentina/endpoint/blue
/api/chile/endpoint/euro
/api/colombia/endpoint/dolar

Es la base del sistema de pestañas del frontend.
========================================================= */
app.get('/api/:pais/endpoint/:id', async (req, res) => {
  const { pais, id } = req.params;

  const info = PAISES[pais];

  if (!info) {
    return res.status(404).json({
      error: `País "${pais}" no encontrado`
    });
  }

  // Chile, Colombia, México, Uruguay, Bolivia y Brasil
  if (EXCHANGE_COUNTRIES[pais]) {
    try {
      const rates = await fetchExchangeRates();

      /* =========================================================
MAPEO DE MONEDAS

Traduce nombres internos del sistema a códigos
internacionales ISO.

Ejemplo:

dolar -> USD
euro -> EUR
peso_arg -> ARS

Facilita la consulta de Exchange Rates.
========================================================= */
      const MAPA_MONEDAS = {
  dolar: 'USD',
  euro: 'EUR',
  real: 'BRL',
  peso_arg: 'ARS',
  peso_mx: 'MXN',
  peso_cl: 'CLP',
  peso_uru: 'UYU',
  libra: 'GBP',
  sol: 'PEN',
  oficial: 'USD',
  binance: 'USD'
};

const code = MAPA_MONEDAS[id] || 'USD';
const value = rates[code];

      return res.json({
        pais: info.nombre,
        bandera: info.bandera,
        moneda: info.moneda,
        endpoint: id,
        data: {
          moneda: code,
          nombre: id,
          compra: value,
          venta: value
        }
      });

    } catch (err) {
      return res.status(500).json({
        error: err.message
      });
    }
  }

  // Argentina y Venezuela
  const endpoint = info.endpoints.find(e => e.id === id);

  if (!endpoint) {
    return res.status(404).json({
      error: `Endpoint "${id}" no encontrado`
    });
  }

  try {

    const data = await fetchApi(
      info.baseUrl,
      endpoint.path
    );

    res.json({
      pais: info.nombre,
      bandera: info.bandera,
      moneda: info.moneda,
      endpoint: endpoint.label,
      data
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});

// Todos los endpoints de un país en paralelo
/* =========================================================
CONSULTA DE TODOS LOS ENDPOINTS

GET /api//todos

Ejecuta todas las consultas disponibles para un país
simultáneamente usando Promise.allSettled().

Ventaja:
Si un endpoint falla, los demás continúan funcionando.
========================================================= */
app.get('/api/:pais/todos', async (req, res) => {
  const { pais } = req.params;
  const info = PAISES[pais];
  if (!info) return res.status(404).json({ error: 'País no encontrado' });

  const resultados = {};
  await Promise.allSettled(
    info.endpoints.map(async ep => {
      try {
        resultados[ep.id] = { label: ep.label, data: await fetchApi(info.baseUrl, ep.path) };
      } catch {
        resultados[ep.id] = { label: ep.label, data: null, error: true };
      }
    })
  );
  res.json({ pais: info.nombre, bandera: info.bandera, moneda: info.moneda, resultados });
});

// Conversion de montos entre USD y moneda local
/* =========================================================
CONVERSOR DE MONEDAS

POST /api/convertir

Recibe:

monto
tasa
dirección

Realiza el cálculo correspondiente y devuelve el
resultado al frontend.

Fórmulas:

USD → Local
resultado = monto × tasa

Local → USD
resultado = monto ÷ tasa
========================================================= */

app.post('/api/convertir', (req, res) => {

  const { monto, tasa, direccion } = req.body;

  /* =========================================================
REGISTRO DE CONVERSIONES

Muestra en consola:

Monto recibido
Tasa utilizada
Tipo de conversión
Resultado obtenido

Facilita pruebas y depuración.
========================================================= */
  console.log('====================');
  console.log('CONVERSIÓN RECIBIDA');
  console.log('Monto:', monto);
  console.log('Tasa:', tasa);
  console.log('Dirección:', direccion);

  let resultado;

  if (direccion === 'usd-to-local') {
    resultado = monto * tasa;
  } else {
    resultado = monto / tasa;
  }

  console.log('Resultado:', resultado);
  console.log('====================');

  res.json({
    ok: true,
    resultado
  });

});
/* =========================================================
RUTA UNIVERSAL

Captura cualquier ruta que no coincida con las APIs
anteriores.

Devuelve index.html para permitir el correcto
funcionamiento de la aplicación web.
========================================================= */
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

/* =========================================================
INICIO DEL SERVIDOR

Pone el servidor en ejecución y comienza a escuchar
solicitudes HTTP en el puerto configurado.

Equivale al punto de entrada principal del backend.
========================================================= */

app.listen(PORT, () => console.log(`✅ DolarApi App → http://localhost:${PORT}`));