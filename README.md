# Infinity Hues Tools

Hub web de herramientas de Infinity Hues. La raíz del proyecto ahora funciona como panel principal y cada herramienta vive en su propia carpeta.

## Estructura del proyecto

```text
/
├── index.html                # Hub principal de Infinity Hues Tools
├── README.md
├── playlist-timer/
│   ├── index.html            # Infinity Hues Playlist Timer
│   ├── styles.css
│   └── script.js
└── prompt-library/
    ├── index.html            # Biblioteca de Prompts v1
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


### 2) Biblioteca de Prompts v1 (activa)
Ruta: `/prompt-library/`

Características actuales:
- Alta, edición y eliminación de prompts.
- Búsqueda por texto y filtro por categoría.
- Persistencia completa en `localStorage`.
- Exportación de la biblioteca a JSON descargable.
- Importación de JSON para restaurar/reemplazar biblioteca.
- Restauración de prompts de ejemplo.

### Próximas herramientas (en el hub)
- Analizador de Ads
- Tracker KDP
- Biblioteca de Links

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
