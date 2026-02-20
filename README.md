# Resource Timeline MVP

MVP para visualizar paquetes de trabajo por **departamento** y **empleado** en una línea de tiempo (4 semanas, día a día).

## Stack

- React + Vite + TypeScript
- API serverless en `api/` (compatible con Vercel Functions)
- Datos seed/fixtures en memoria (para demo del MVP)

## Funcionalidades incluidas

- Vista principal "Recursos" con:
  - Eje vertical: Departamentos -> empleados.
  - Eje horizontal: 28 días (4 semanas) desde una fecha de demo.
- Bloques de tareas por empleado usando:
  - `scheduledStartDate` como inicio visual.
  - `durationDays` para ancho del bloque.
- Modal de detalle al seleccionar una tarea con:
  - título, descripción, proyecto, fechas y dependencias.
  - `deadlineDate` destacado visualmente.
- Filtros mínimos:
  - por departamento.
  - por nombre de empleado (buscador).

## API MVP “Vista Recursos” (Paso 1 + Paso 2)

Se implementó el modelo de datos normalizado + CRUD mínimo con validaciones en rutas `api/`:

- `/api/departments`
- `/api/employees`
- `/api/projects`
- `/api/tasks`
- `/api/task-assignments`
- `/api/time-off`

Cada colección soporta:

- `GET /api/<resource>`
- `POST /api/<resource>`
- `GET /api/<resource>/:id`
- `PATCH /api/<resource>/:id`
- `DELETE /api/<resource>/:id`

### Reglas de validación implementadas

- `endDate >= startDate` para Task y TimeOff.
- `Department.name` único.
- `Project.name` único.
- FKs válidas en Employee, Task, TaskAssignment y TimeOff.
- `allocationHours >= 0`, `estimatedHours >= 0`.
- `status` y `type` restringidos a enums válidos.
- `TaskAssignment (taskId, employeeId)` único.
- Soft delete en Department/Employee/Project (`isActive=false`).
- `Task DELETE` devuelve `409` si tiene asignaciones relacionadas.

### POSTERGADO (no Vercel-only)

- Persistencia relacional real con Postgres/ORM y migraciones automáticas de deploy (`prisma migrate deploy`).
- Estado actual de esta iteración: se usa almacenamiento en memoria para demo y validación funcional del flujo CRUD en serverless.

## Variables de entorno

No son obligatorias para esta iteración (almacenamiento en memoria).

Para un siguiente paso con persistencia en Vercel se recomienda:

- `DATABASE_URL` (Vercel Postgres / Neon / Supabase)

## Estructura principal

```txt
src/
  components/
    ResourceTimeline.tsx
    DepartmentSection.tsx
    EmployeeRow.tsx
    TaskBlock.tsx
    TaskDetailsModal.tsx
  data/
    mock-data.ts
  types/
    workPackage.ts
  utils/
    dateUtils.ts
    timelineUtils.ts
api/
  departments/
  employees/
  projects/
  tasks/
  task-assignments/
  time-off/
lib/
  api.js
  store.js
```
