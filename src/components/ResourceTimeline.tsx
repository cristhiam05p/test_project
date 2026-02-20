import { useMemo, useState } from 'react';
import type { WorkPackage } from '../types/workPackage';
import { formatDayLabel, getDayRange, getWeekLabel } from '../utils/dateUtils';
import { groupByDepartmentAndEmployee } from '../utils/timelineUtils';
import { DepartmentSection } from './DepartmentSection';
import { TaskDetailsModal } from './TaskDetailsModal';

interface ResourceTimelineProps {
  tasks: WorkPackage[];
  timelineStartDate: string;
  timelineDays?: number;
}

const DAY_WIDTH = 42;

export const ResourceTimeline = ({
  tasks,
  timelineStartDate,
  timelineDays = 28,
}: ResourceTimelineProps) => {
  const [selectedTask, setSelectedTask] = useState<WorkPackage | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Todos');
  const [employeeQuery, setEmployeeQuery] = useState<string>('');

  const departments = useMemo(
    () => ['Todos', ...new Set(tasks.map((task) => task.department))],
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesDepartment =
        selectedDepartment === 'Todos' || task.department === selectedDepartment;
      const matchesEmployee = task.employeeName
        .toLowerCase()
        .includes(employeeQuery.trim().toLowerCase());
      return matchesDepartment && matchesEmployee;
    });
  }, [tasks, selectedDepartment, employeeQuery]);

  const groupedData = useMemo(() => groupByDepartmentAndEmployee(filteredTasks), [filteredTasks]);

  const dayRange = useMemo(
    () => getDayRange(timelineStartDate, timelineDays),
    [timelineDays, timelineStartDate],
  );

  const taskTitleById = useMemo(() => {
    return new Map(tasks.map((task) => [task.id, task.title]));
  }, [tasks]);

  return (
    <div className="resource-timeline-page">
      <header>
        <h1>Vista Recursos (MVP)</h1>
        <p>Visualización por departamento y empleado para saber quién está haciendo qué y cuándo.</p>
      </header>

      <section className="filters">
        <label>
          Departamento
          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
          >
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </label>

        <label>
          Empleado
          <input
            placeholder="Buscar por nombre"
            value={employeeQuery}
            onChange={(event) => setEmployeeQuery(event.target.value)}
          />
        </label>
      </section>

      <div className="timeline-shell">
        <div className="timeline-header">
          <div className="employee-label header">Departamento / Empleado</div>
          <div className="timeline-days" style={{ width: DAY_WIDTH * timelineDays }}>
            {dayRange.map((day, index) => (
              <div key={index} className="day-header" style={{ width: DAY_WIDTH }}>
                <strong>{getWeekLabel(day)}</strong>
                <span>{formatDayLabel(day)}</span>
              </div>
            ))}
          </div>
        </div>

        {groupedData.length === 0 ? (
          <p className="empty-state">No hay tareas con los filtros actuales.</p>
        ) : (
          groupedData.map((department) => (
            <DepartmentSection
              key={department.department}
              department={department.department}
              employees={department.employees}
              timelineStartDate={timelineStartDate}
              timelineDays={timelineDays}
              dayWidth={DAY_WIDTH}
              onTaskSelect={setSelectedTask}
            />
          ))
        )}
      </div>

      <TaskDetailsModal task={selectedTask} taskTitleById={taskTitleById} onClose={() => setSelectedTask(null)} />
    </div>
  );
};
