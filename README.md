# Infinity Hues Playlist Timer

Mini aplicación web para calcular la duración de playlists y llegar a un objetivo (por defecto, **60:00**).

## Características

- Añadir canciones con nombre opcional, minutos y segundos.
- Validación de segundos entre 0 y 59.
- Minutos/segundos vacíos se interpretan como 0.
- Bloquea añadir canciones de 00:00.
- Historial con:
  - número de canción,
  - nombre,
  - duración,
  - total acumulado por fila,
  - botón de eliminar.
- Resumen en tiempo real con:
  - total acumulado,
  - restante,
  - porcentaje completado,
  - estado visual (Falta música / Perfecto / Te pasaste).
- Objetivo configurable en minutos (60 por defecto).
- Botón **Limpiar todo**.
- Persistencia con `localStorage`.
- Botón **Copiar resumen** para portapapeles.

## Archivos principales

- `index.html`
- `styles.css`
- `script.js`

## Ejecutar localmente

1. Descarga o clona este repositorio.
2. Abre la carpeta del proyecto.
3. Haz doble clic en `index.html` o levanta un servidor local.

Ejemplo con Python:

```bash
python3 -m http.server 8080
```

Después, abre:

```text
http://localhost:8080
```

## Despliegue

### Netlify

1. Crea un nuevo sitio en Netlify con **Add new site > Import an existing project** o arrastra la carpeta del proyecto.
2. Si usas importación por Git, selecciona este repositorio.
3. Build command: *(vacío, no requiere build)*.
4. Publish directory: `/` (raíz del proyecto).

### Vercel

1. Importa el repositorio en Vercel.
2. Framework preset: **Other**.
3. Build and Output settings:
   - Build command: *(vacío)*
   - Output directory: `.`
4. Deploy.

### GitHub Pages

1. Sube el proyecto a un repositorio de GitHub.
2. Ve a **Settings > Pages**.
3. En **Source**, selecciona la rama (por ejemplo `main`) y carpeta `/ (root)`.
4. Guarda y espera la URL pública.

## Próximas mejoras posibles

- Exportar a CSV.
- Crear varias playlists.
- Guardar plantillas.
- Modo 30/45/60/90 minutos.
