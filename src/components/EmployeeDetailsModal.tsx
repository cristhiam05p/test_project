import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import type { EmployeeProfile } from "../data/mock-data";
import type { WorkPackage } from "../types/workPackage";
import { addDays, differenceInDays, formatISODate, getISOWeek, toDate } from "../utils/dateUtils";

interface EmployeeDetailsModalProps {
  employee: EmployeeProfile | null;
  tasks: WorkPackage[];
  timelineStartDate: string;
  timelineDays: number;
  onClose: () => void;
}

const getVisibleHours = (tasks: WorkPackage[], startDate: string, timelineDays: number) => {
  const visibleStart = toDate(startDate);
  const visibleEnd = addDays(visibleStart, timelineDays - 1);

  return tasks.reduce((total, task) => {
    const taskStart = toDate(task.scheduledStartDate);
    const taskEnd = addDays(taskStart, task.durationDays - 1);
    if (taskEnd < visibleStart || taskStart > visibleEnd) {
      return total;
    }
    const overlapStart = taskStart < visibleStart ? visibleStart : taskStart;
    const overlapEnd = taskEnd > visibleEnd ? visibleEnd : taskEnd;
    const overlapDays = differenceInDays(overlapStart, overlapEnd) + 1;
    return total + overlapDays * 8;
  }, 0);
};

const getOverloadedWeeks = (tasks: WorkPackage[], weeklyCapacityHours: number) => {
  const weekHours = new Map<string, number>();

  tasks.forEach((task) => {
    const taskStart = toDate(task.scheduledStartDate);
    Array.from({ length: task.durationDays }, (_, dayOffset) => addDays(taskStart, dayOffset)).forEach((day) => {
      const key = `${day.getFullYear()}-${getISOWeek(day)}`;
      weekHours.set(key, (weekHours.get(key) ?? 0) + 8);
    });
  });

  return [...weekHours.entries()]
    .filter(([, hours]) => hours > weeklyCapacityHours)
    .map(([weekKey, hours]) => ({ weekKey, hours }));
};

export const EmployeeDetailsModal = ({
  employee,
  tasks,
  timelineStartDate,
  timelineDays,
  onClose,
}: EmployeeDetailsModalProps) => {
  const visibleHours = useMemo(() => {
    if (!employee) {
      return 0;
    }
    return getVisibleHours(tasks, timelineStartDate, timelineDays);
  }, [employee, tasks, timelineStartDate, timelineDays]);

  const overloadedWeeks = useMemo(() => {
    if (!employee) {
      return [];
    }
    return getOverloadedWeeks(tasks, employee.weeklyCapacityHours);
  }, [employee, tasks]);

  useEffect(() => {
    if (!employee) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [employee, onClose]);

  if (!employee) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <aside className="modal-panel" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" onClick={onClose} type="button" aria-label="Cerrar detalles de empleado">
          ✕
        </button>

        <h3>{employee.employeeName}</h3>

        <dl>
          <dt>Departamento</dt>
          <dd>{employee.department}</dd>

          <dt>Rol</dt>
          <dd>{employee.role}</dd>

          <dt>Coste/hora</dt>
          <dd>€{employee.hourlyCost}</dd>

          <dt>Horas/semana</dt>
          <dd>{employee.weeklyCapacityHours} h</dd>

          <dt>Ausencias</dt>
          <dd>
            {employee.absences.length === 0
              ? "Sin ausencias registradas"
              : employee.absences.map((absence) => (
                  <div key={`${absence.startDate}-${absence.reason}`}>
                    {absence.reason}: {absence.startDate} → {absence.endDate}
                  </div>
                ))}
          </dd>

          <dt>Horas asignadas (ventana visible)</dt>
          <dd>{visibleHours} h</dd>

          <dt>Semanas con sobrecarga</dt>
          <dd>
            {overloadedWeeks.length === 0
              ? "Sin sobrecarga"
              : overloadedWeeks.map((entry) => (
                  <div key={entry.weekKey}>
                    {entry.weekKey} ({entry.hours} h)
                  </div>
                ))}
          </dd>
        </dl>

        <h4>Tareas asignadas</h4>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong> — {task.projectName} ({task.scheduledStartDate} → {formatISODate(addDays(toDate(task.scheduledStartDate), task.durationDays - 1))})
              <br />
              <small>{task.description}</small>
            </li>
          ))}
        </ul>
      </aside>
    </div>,
    document.body,
  );
};
