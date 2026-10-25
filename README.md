# TicketFlow — Gestión de incidencias y solicitudes de soporte TI

Aplicación web académica para registrar, consultar y hacer seguimiento de tickets de una mesa de servicios. Proyecto desarrollado para el **Examen Final de Inteligencia Artificial — GitHub Copilot**.

## 1. Contexto y problemática

En áreas de soporte tecnológico, las incidencias y solicitudes pueden reportarse por distintos medios (mensajes, correos u hojas de cálculo). Esta dispersión dificulta identificar responsables, consultar el estado de atención y priorizar tareas.

## 2. Usuario objetivo

Personal de mesa de ayuda, asistentes de soporte y coordinadores de TI que necesitan controlar solicitudes en una interfaz centralizada.

## 3. Objetivo de la solución

Desarrollar una aplicación web simple y funcional para organizar la atención de soporte TI mediante registro, clasificación, seguimiento y exportación de tickets.

## 4. Funcionalidades

- Crear tickets con asunto, solicitante, área, tipo, prioridad, estado y descripción.
- Consultar el listado de tickets y los indicadores generales.
- Buscar tickets por código, asunto, solicitante, área o descripción.
- Filtrar por estado, prioridad y tipo.
- Editar y eliminar tickets (con confirmación).
- Exportar registros a CSV compatible con programas de hojas de cálculo.
- Cargar cinco tickets ficticios para probar la aplicación.
- Guardar los datos localmente en el navegador mediante `localStorage`.
- Adaptar la interfaz a computadoras y móviles.

## 5. Tecnologías

- **HTML5:** estructura semántica y formularios.
- **CSS3:** diseño responsivo en modo oscuro.
- **JavaScript:** validaciones, filtros, persistencia y exportación.
- **Git / GitHub:** control de versiones y repositorio público.
- **GitHub Pages:** publicación estática.
- **GitHub Copilot:** asistencia durante análisis, implementación, revisión y documentación (adjuntar evidencia real).

## 6. Estructura del proyecto

```text
EF_Copilot_TicketFlow/
├── index.html
├── styles.css
├── app.js
├── README.md
```

## 7. Ejecución local

1. Descarga o clona el repositorio.
2. Abre la carpeta en Visual Studio Code.
3. Abre `index.html` en tu navegador (o usa la extensión Live Server).
4. Pulsa **Cargar demo** para añadir datos de ejemplo.
5. Prueba crear, editar, filtrar, eliminar y exportar tickets.

**No requiere instalar dependencias ni configurar una base de datos.**

## 8. Publicación con GitHub Pages

1. Crea un repositorio público en GitHub y sube estos archivos a la rama `main`.
2. En el repositorio, ve a **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige **main**, carpeta **/(root)** y pulsa **Save**.
5. Revisa el enlace publicado, usualmente `https://github.com/JASQC16/TicketFlow`.
6. Verifica desde una ventana privada que la aplicación y todas sus funciones se puedan abrir.

## 9. Pruebas funcionales sugeridas

| Prueba | Resultado esperado |
| --- | --- |
| Crear ticket con datos completos | Aparece un nuevo registro y aumenta el indicador total. |
| Intentar guardar sin asunto | Se muestra un mensaje y no se guarda. |
| Filtrar por prioridad Alta | Solo aparecen tickets con esa prioridad. |
| Editar un ticket y cambiar a Resuelto | Se actualiza la fila y el indicador de resueltos. |
| Recargar la página | Los registros persisten en el mismo navegador. |
| Exportar CSV | Se descarga el archivo `ticketflow_tickets.csv`. |
| Eliminar un ticket (confirmar) | Desaparece la fila y se actualizan los indicadores. |

## 10. Alcance y limitaciones

Esta es una **demostración académica**, no un sistema institucional en producción. El almacenamiento en `localStorage` es por navegador/dispositivo; los datos no se comparten entre usuarios, no existe autenticación y no se recomienda registrar información personal real ni confidencial.

## 11. Enlaces de entrega

- **Repositorio público:** https://github.com/JASQC16/TicketFlow
- **Aplicación en GitHub Pages:** https://jasqc16.github.io/TicketFlow/
- **Video demostrativo (máximo 1 minuto):** [AGREGAR URL REAL]

## 13. Autoría

Proyecto elaborado y adaptado por el/la estudiante como parte de una evaluación académica, con revisión propia del código y apoyo documentado de GitHub Copilot.
