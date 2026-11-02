# FitPlus — edición de preproducción

Portal estático, móvil y accesible, con actualización editorial diaria mediante GitHub Actions, RSS y OpenAI. **No está desplegado y la IA no se ejecuta sin credenciales**. El archivo `data/news.json` empieza vacío a propósito: no se publican ejemplos ficticios como noticias.

## Cómo publicar

1. Crea un repositorio en GitHub y sube los contenidos de esta carpeta a la raíz de la rama `main` (incluye `.github`).
2. En **Settings → Secrets and variables → Actions**, crea el secreto `OPENAI_API_KEY` con tu clave de la API. No la pegues en HTML ni en JavaScript. Necesitas facturación de API activa.
3. En **Settings → Pages → Build and deployment** selecciona **GitHub Actions**.
4. Ve a **Actions → FitPlus · Curación IA y publicación → Run workflow**. El primer lanzamiento puede fallar si las fuentes accesibles no ofrecen artículos adecuados; en ese caso no se inventan noticias.
5. En **Settings → Secrets and variables → Actions → Variables** añade `PAGES_JSON_URL` con la URL real de tu JSON publicado, por ejemplo `https://TU_USUARIO.github.io/TU_REPO/data/news.json`; esto conserva ediciones anteriores entre ejecuciones.
6. La actualización programada es 06:17 UTC cada día (GitHub no garantiza la ejecución al minuto; puede haber retrasos o ejecuciones omitidas). Verifica los registros de Actions regularmente.

## Cómo funciona

- Descubre artículos recientes mediante un feed directo de NIH y Google News RSS, pero SOLO admite fuentes de la lista aprobada en `scripts/update_news.py`. Verifica URL del sitio de origen cuando existe; para Google News exige metadatos del origen.
- El modelo evalúa **únicamente titular, fecha y extracto RSS**, sin pretender haber leído estudios íntegros. Devuelve JSON bajo esquema estricto y se ejecutan validaciones adicionales (puntuación, longitud, categoría, duplicados).
- Se muestran enlaces de origen, que en algunos RSS pueden ser **enlaces intermedios de Google News**. Los nombres de fuente identificados por RSS se deben revisar antes del lanzamiento comercial.
- Si falla la IA o no hay candidatos aptos, el proceso termina sin actualizar `news.json` y la última edición desplegada se mantiene.
- Las noticias pueden conservarse hasta 15 días para evitar una página vacía, con fechas visibles; no se simula que sean del día.

## Seguridad y límites

- Nunca subir la clave de OpenAI al repositorio. Establece límites de gasto en la cuenta API y revisa los logs.
- No se publica el artículo íntegro de medios de terceros. Comprueba condiciones de feeds y atribuciones.
- Este enfoque de preproducción **no verifica de manera independiente el texto completo**, DOI, metodología, ni la exactitud científica de las conclusiones. Antes de lanzar un medio comercial añade revisión humana, verificación por DOI/enlace final y políticas de privacidad/legales y cookies si se incorporan analíticas.
- Los marcadores se guardan solo en `localStorage` del navegador.
- Cualquier cambio de fuente o configuración exige revisar el flujo y las pruebas.

## Comprobaciones locales

`python -m unittest discover -s tests -v` (sin clave ni conexión).

Prueba web local: `python -m http.server 8000`, después abre `http://localhost:8000/` desde esta carpeta. Sin publicaciones, se muestra el estado vacío previsto.

## Antes de lanzar

Valida la procedencia de los RSS usados, comprueba al menos varias ejecuciones reales, revisa una muestra de titulares/atribuciones, personaliza dominio, aviso legal, política de privacidad y contacto editorial. En caso de monetizar, comprueba licencias de contenido e imágenes.
