# 💵 DolarApi App

Aplicación web fullstack que muestra cotizaciones de monedas en tiempo real para 8 países de América Latina, con un conversor de divisas integrado. Consume la API pública de [DolarApi.com](https://dolarapi.com) para Argentina y Venezuela, y [open.er-api.com](https://open.er-api.com) para el resto de países.

---

## 🌎 Países soportados

| País       | Moneda | Fuente de datos         |
|------------|--------|-------------------------|
| 🇦🇷 Argentina | ARS  | dolarapi.com            |
| 🇻🇪 Venezuela | VES  | ve.dolarapi.com         |
| 🇨🇱 Chile     | CLP  | open.er-api.com (USD)   |
| 🇨🇴 Colombia  | COP  | open.er-api.com (USD)   |
| 🇲🇽 México    | MXN  | open.er-api.com (USD)   |
| 🇺🇾 Uruguay   | UYU  | open.er-api.com (USD)   |
| 🇧🇴 Bolivia   | BOB  | open.er-api.com (USD)   |
| 🇧🇷 Brasil    | BRL  | open.er-api.com (USD)   |

---

## ✨ Funcionalidades

- **Dashboard de cotizaciones** por país con selección de endpoint (Dólar Blue, Oficial, MEP, CCL, Cripto, etc.)
- **Ticker** en tiempo real con los valores más relevantes
- **Conversor de monedas** (USD ↔ moneda local) con selector de país y tipo de cambio
- **Actualización manual** con botón de refresco
- Indicador de estado de conexión a la API
- Diseño responsivo con fuentes Space Grotesk y Space Mono

---

## 🗂 Estructura del proyecto

```
dolarapi-app/
├── src/
│   └── server.js          # Servidor Express + lógica de APIs
├── public/
│   ├── index.html         # SPA principal
│   ├── css/
│   │   └── styles.css     # Estilos globales
│   └── js/
│       └── app.js         # Lógica del frontend (estado, fetch, render)
└── package.json
```

---

## 🚀 Instalación y uso

### Requisitos

- Node.js 16+
- npm

### Pasos

```bash
# 1. Clonar o descomprimir el proyecto
cd dolarapi-app

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor
npm start
```

El servidor queda disponible en `http://localhost:3001`.

Para desarrollo también puedes usar:

```bash
npm run dev
```

---

## ⚙️ Variables de entorno

| Variable | Default | Descripción               |
|----------|---------|---------------------------|
| `PORT`   | `3001`  | Puerto donde escucha el servidor |

---

## 🔌 API del backend

El servidor actúa como proxy entre el frontend y las APIs externas.

### `GET /api/paises`
Devuelve la lista de países disponibles con sus endpoints configurados.

### `GET /api/:pais/cotizaciones`
Retorna las cotizaciones principales del país indicado.

**Ejemplo:** `GET /api/argentina/cotizaciones`

### `GET /api/:pais/endpoint/:id`
Retorna los datos de un endpoint específico de un país.

**Ejemplo:** `GET /api/argentina/endpoint/blue`

### `GET /api/:pais/todos`
Consulta todos los endpoints del país en paralelo.

**Ejemplo:** `GET /api/venezuela/todos`

### `POST /api/convertir`
Realiza una conversión de moneda.

**Body:**
```json
{
  "monto": 100,
  "tasa": 1200,
  "direccion": "usd-to-local"
}
```

`direccion` puede ser `"usd-to-local"` o `"local-to-usd"`.

---

## 📦 Dependencias

| Paquete       | Versión   | Uso                            |
|---------------|-----------|--------------------------------|
| `express`     | ^4.18.2   | Servidor HTTP                  |
| `node-fetch`  | ^2.7.0    | Peticiones a APIs externas     |
| `cors`        | ^2.8.5    | Habilitación de CORS           |

---

## 📝 Notas

- Para **Argentina** y **Venezuela** se usan las APIs regionales de DolarApi.com que incluyen tipos de cambio paralelos, blue, bolsa, etc.
- Para el resto de países (Chile, Colombia, México, Uruguay, Bolivia y Brasil) se utiliza [open.er-api.com](https://open.er-api.com/v6/latest/USD) como fuente de tasas de cambio respecto al USD.
- El frontend es una SPA (Single Page Application) sin frameworks, con JavaScript vanilla.
