# Resource Timeline MVP

MVP para visualizar paquetes de trabajo por **departamento** y **empleado** en una línea de tiempo (4 semanas, día a día).

## Stack

- React + Vite + TypeScript
- Sin backend (mock data local)

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
```
