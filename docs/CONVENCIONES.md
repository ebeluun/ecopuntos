# Convenciones de EcoPuntos

## Archivos y carpetas
- Usar minúsculas y guiones: `nombre-archivo`.
- Mantener HTML en la raíz, estilos en `css/`, JavaScript en `js/` y documentación en `docs/`.
- Evitar archivos duplicados y mantener una responsabilidad clara por archivo.

## Código
- Indentar con 2 espacios.
- Usar nombres descriptivos.
- En JavaScript, variables y funciones en `camelCase`.
- En CSS, clases en `kebab-case`.
- Usar etiquetas HTML semánticas.
- Comentar solo la lógica que no sea evidente.

## Ramas
- `main`: versión estable.
- `develop`: integración.
- `feature/descripcion`: nueva funcionalidad.
- `fix/descripcion`: corrección.

## Commits
Formato: `tipo: descripción breve`.
- `feat:` funcionalidad nueva.
- `fix:` corrección.
- `docs:` documentación.
- `style:` formato o estilos.
- `refactor:` mejora interna.

Ejemplos:
- `docs: documentar ambiente de desarrollo`
- `feat: agregar catálogo de centros`

## Revisión
Antes de integrar un cambio, revisar que:
- Cumpla el objetivo de la tarea.
- No incluya contraseñas, tokens ni datos personales.
- Se haya probado localmente.
- La descripción del Pull Request explique qué se modificó.
