# Estrategia de versiones de EcoPuntos

**Tarea:** SCRUM-52 — Estrategia de versiones.  
**Sprint:** 1.

## 1. Control de versiones

Se utilizará **Git** para registrar el historial del código y **GitHub** como repositorio remoto para colaborar. Los cambios se guardarán en commits pequeños y descriptivos.

## 2. Estrategia de ramas

Se propone un flujo sencillo basado en ramas:

| Rama | Uso |
|---|---|
| `main` | Versión estable del proyecto. Solo recibe cambios revisados. |
| `develop` | Rama de integración del trabajo del equipo. |
| `feature/nombre-tarea` | Desarrollo de una funcionalidad o tarea. |
| `fix/nombre-error` | Corrección de un error. |

### Flujo de trabajo

1. Actualizar la rama `develop`.
2. Crear una rama `feature/` o `fix/` para la tarea.
3. Realizar cambios y guardarlos en commits.
4. Subir la rama a GitHub.
5. Crear un Pull Request hacia `develop`.
6. Solicitar revisión y corregir observaciones.
7. Integrar el cambio cuando cumpla los criterios de aceptación.
8. Cuando el equipo valide una versión estable, integrar `develop` en `main`.

No se deben realizar cambios directamente en `main` para el trabajo cotidiano.

## 3. Convención de commits

Formato:

```text
tipo: descripción breve en infinitivo o presente
```

Tipos recomendados:

- `feat:` nueva funcionalidad.
- `fix:` corrección de error.
- `docs:` documentación.
- `style:` cambios de formato o presentación sin modificar lógica.
- `refactor:` mejora interna sin cambiar el comportamiento.
- `test:` pruebas.
- `chore:` mantenimiento o configuración.

Ejemplos:

```text
feat: agregar vista de perfil
fix: corregir filtro de materiales
docs: documentar arquitectura del sitio
chore: organizar estructura de carpetas
```

## 4. Numeración de versiones

Cuando exista una entrega estable, se propone utilizar **Versionado Semántico (MAJOR.MINOR.PATCH)**:

- **MAJOR:** cambio grande que rompe compatibilidad o modifica de forma importante el sistema.
- **MINOR:** nueva funcionalidad compatible con lo anterior.
- **PATCH:** corrección o mejora pequeña sin agregar una función importante.

Ejemplo de evolución:

| Versión | Significado |
|---|---|
| `0.1.0` | Primer prototipo navegable |
| `0.2.0` | Nueva funcionalidad compatible |
| `0.2.1` | Corrección de errores |
| `1.0.0` | Primera versión completa y validada por el equipo |

Durante el desarrollo inicial se usará `0.x.x`, ya que el producto todavía puede cambiar. La versión `1.0.0` se asignará únicamente cuando el equipo considere que el alcance principal está completo y probado.

## 5. Etiquetas (tags) y entregas

- Crear un tag de Git para cada versión estable, por ejemplo `v0.1.0`.
- Acompañar cada entrega con una descripción de los cambios.
- No etiquetar como estable una versión que no haya sido revisada.
- Mantener el README actualizado con instrucciones vigentes.

## 6. Reglas para integrar cambios

Antes de aceptar un Pull Request:

- La tarea debe estar relacionada con un elemento del tablero.
- El código debe seguir las convenciones del equipo.
- La funcionalidad debe probarse localmente.
- No debe incluir credenciales ni datos privados.
- Debe tener una descripción clara y revisión de otro integrante.

## 7. Resultado esperado

El equipo podrá identificar qué cambios se realizaron, quién los realizó y en qué versión se encuentran, además de recuperar versiones anteriores si ocurre un problema.
