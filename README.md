# Infinity Hues Tools

Hub web de herramientas de Infinity Hues. La raíz del proyecto ahora funciona como panel principal y cada herramienta vive en su propia carpeta.

## Estructura del proyecto

```text
/
├── index.html                # Hub principal de Infinity Hues Tools
├── README.md
├── link-library/
│   ├── index.html            # Infinity Hues Biblioteca de Links v1
│   ├── styles.css
│   └── script.js
├── prompt-library/
│   ├── index.html            # Infinity Hues Biblioteca de Prompts v1
│   ├── styles.css
│   └── script.js
└── playlist-timer/
    ├── index.html            # Infinity Hues Playlist Timer
    ├── styles.css
    └── script.js
```

## Herramientas

### 1) Playlist Timer (activa)
Ruta: `/playlist-timer/`

Características actuales (sin cambios funcionales):
- Añadir canciones con nombre opcional, minutos y segundos.
- Validación de segundos entre 0 y 59.
- Minutos/segundos vacíos se interpretan como 0.
- Bloquea añadir canciones de 00:00.
- Historial con número, nombre, duración, acumulado y eliminación.
- Resumen en tiempo real con total, restante, porcentaje y estado.
- Objetivo configurable en minutos (60 por defecto).
- Botón **Limpiar todo**.
- Persistencia en `localStorage`.
- Botón **Copiar resumen** al portapapeles.

### 2) Biblioteca de Links v1 (activa)
Ruta: `/link-library/`

Características actuales:
- Alta, edición, duplicado y eliminación de links.
- Búsqueda por texto y filtro por categoría.
- Apertura de link en nueva pestaña.
- Copiar URL y copiar ficha completa al portapapeles.
- Persistencia en `localStorage`.
- Importación y exportación de JSON.
- Exportación de CSV.
- Dataset inicial con links de ejemplo genéricos.

### 3) Biblioteca de Prompts v1 (activa)
Ruta: `/prompt-library/`

Características actuales:
- Guardado de prompts con título, categoría y contenido.
- Búsqueda por texto en título, categoría y contenido.
- Copiar prompt al portapapeles.
- Eliminación individual y limpieza completa.
- Persistencia en `localStorage`.

### Próximas herramientas (en el hub)
- Analizador de Ads
- Tracker KDP

## Ejecutar localmente

1. Clona o descarga este repositorio.
2. Abre la carpeta del proyecto.
3. Ejecuta un servidor local en la raíz.

Ejemplo con Python:

```bash
python3 -m http.server 8080
```

Luego abre:

- Hub: `http://localhost:8080/`
- Playlist Timer: `http://localhost:8080/playlist-timer/`
- Biblioteca de Links: `http://localhost:8080/link-library/`
- Biblioteca de Prompts: `http://localhost:8080/prompt-library/`

## Despliegue

### Netlify

- Build command: *(vacío, no requiere build)*
- Publish directory: `/` (raíz del proyecto)

### Vercel

- Framework preset: **Other**
- Build command: *(vacío)*
- Output directory: `.`

### GitHub Pages

- Source: rama principal + carpeta `/ (root)`
