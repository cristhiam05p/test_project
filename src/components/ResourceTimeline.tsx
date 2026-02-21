import { useMemo, useState } from "react";
import type { EmployeeProfile } from "../data/mock-data";
import type { WorkPackage } from "../types/workPackage";
import {
  formatDayLabel,
  formatDayMonth,
  getDayRange,
  getWeekHeaderGroups,
  getWeekLabel,
} from "../utils/dateUtils";
import { includesNormalized } from "../utils/textUtils";
import { groupByDepartmentAndEmployee } from "../utils/timelineUtils";
import { DepartmentSection } from "./DepartmentSection";
import { EmployeeDetailsModal } from "./EmployeeDetailsModal";
import { TaskDetailsModal } from "./TaskDetailsModal";

interface ResourceTimelineProps {
  tasks: WorkPackage[];
  employees: EmployeeProfile[];
  timelineStartDate: string;
  timelineDays?: number;
}

const DAY_WIDTH = 42;
const EXPANDED_DAY_WIDTH = 72;
const WEEK_RANGE_MIN_WIDTH = 150;

const getCompactDayLabel = (day: Date): string =>
  day.toLocaleDateString("es-ES", { day: "2-digit" });

export const ResourceTimeline = ({
  tasks,
  employees,
  timelineStartDate,
  timelineDays = 28,
}: ResourceTimelineProps) => {
  const [selectedTask, setSelectedTask] = useState<WorkPackage | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("Todos");
  const [employeeQuery, setEmployeeQuery] = useState<string>("");
  const [expandedWeekKey, setExpandedWeekKey] = useState<string | null>(null);

  const departments = useMemo(
    () => ["Todos", ...new Set(tasks.map((task) => task.department))],
    [tasks],
  );

  const projectLegend = useMemo(() => {
    const projects = new Map<
      string,
      { projectName: string; projectColor: string }
    >();
    tasks.forEach((task) => {
      projects.set(task.projectId, {
        projectName: task.projectName,
        projectColor: task.projectColor,
      });
    });
    return [...projects.entries()].map(([projectId, data]) => ({
      projectId,
      ...data,
    }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesDepartment =
        selectedDepartment === "Todos" ||
        task.department === selectedDepartment;

      const matchesSearch =
        includesNormalized(task.employeeName, employeeQuery) ||
        includesNormalized(task.title, employeeQuery) ||
        includesNormalized(task.description, employeeQuery) ||
        includesNormalized(task.projectName, employeeQuery);

      return matchesDepartment && matchesSearch;
    });
  }, [tasks, selectedDepartment, employeeQuery]);

  const groupedData = useMemo(
    () => groupByDepartmentAndEmployee(filteredTasks),
    [filteredTasks],
  );

  const dayRange = useMemo(
    () => getDayRange(timelineStartDate, timelineDays),
    [timelineDays, timelineStartDate],
  );

  const weekHeaderGroups = useMemo(
    () => getWeekHeaderGroups(dayRange),
    [dayRange],
  );

  // Decisión: modo accordion para KW (solo una semana expandida a la vez).
  const dayWidths = useMemo(() => {
    const weekByDay = dayRange.map((day) => {
      const matchingWeek = weekHeaderGroups.find((group) => day >= group.weekStart && day <= group.weekEnd);
      return matchingWeek?.key;
    });

    return weekByDay.map((weekKey) => (weekKey && weekKey === expandedWeekKey ? EXPANDED_DAY_WIDTH : DAY_WIDTH));
  }, [dayRange, weekHeaderGroups, expandedWeekKey]);

  const cumulativeOffsets = useMemo(() => {
    let acc = 0;
    return dayWidths.map((width) => {
      const left = acc;
      acc += width;
      return left;
    });
  }, [dayWidths]);

  const totalTimelineWidth = useMemo(
    () => dayWidths.reduce((sum, width) => sum + width, 0),
    [dayWidths],
  );

  const taskTitleById = useMemo(() => {
    return new Map(tasks.map((task) => [task.id, task.title]));
  }, [tasks]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.employeeId === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId],
  );

  const selectedEmployeeTasks = useMemo(
    () => tasks.filter((task) => task.employeeId === selectedEmployeeId),
    [tasks, selectedEmployeeId],
  );

  return (
    <div className="resource-timeline-page">
      <header>
        <h1>Vista Recursos (MVP)</h1>
        <p>
          Visualización por departamento y empleado para saber quién está
          haciendo qué y cuándo.
        </p>
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
            placeholder="Buscar por nombre, tarea o descripción"
            value={employeeQuery}
            onChange={(event) => setEmployeeQuery(event.target.value)}
          />
        </label>
      </section>

      <section className="project-legend" aria-label="Leyenda de proyectos">
        {projectLegend.map((project) => (
          <span key={project.projectId} className="legend-item">
            <i
              style={{ backgroundColor: project.projectColor }}
              aria-hidden="true"
            />
            {project.projectName}
          </span>
        ))}
      </section>

      <div className="timeline-shell">
        <div className="timeline-header">
          <div className="employee-label header">Departamento / Empleado</div>

          <div
            className="timeline-days"
            style={{ width: totalTimelineWidth }}
          >
            <div className="week-header-row">
              {weekHeaderGroups.map((weekGroup) => {
                const weekDays = dayRange.filter(
                  (day) => day >= weekGroup.weekStart && day <= weekGroup.weekEnd,
                );
                const weekWidth = weekDays.reduce((sum, day) => {
                  const dayIndex = dayRange.indexOf(day);
                  return sum + dayWidths[dayIndex];
                }, 0);
                const showWeekRange = weekWidth >= WEEK_RANGE_MIN_WIDTH;
                const isActive = expandedWeekKey === weekGroup.key;

                return (
                  <button
                    key={weekGroup.key}
                    className={`week-header ${isActive ? "week-header--active" : ""}`}
                    style={{ width: weekWidth }}
                    type="button"
                    onClick={() => setExpandedWeekKey((current) => (current === weekGroup.key ? null : weekGroup.key))}
                  >
                    <strong className="week-label">{getWeekLabel(weekGroup.weekStart)}</strong>
                    {showWeekRange ? (
                      <span className="week-range">
                        ({formatDayMonth(weekGroup.weekStart)} -{" "}
                        {formatDayMonth(weekGroup.weekEnd)})
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="day-header-row">
              {dayRange.map((day, index) => (
                <div
                  key={index}
                  className="day-header"
                  style={{ width: dayWidths[index] }}
                >
                  <span className="day-label day-label--default">{formatDayLabel(day)}</span>
                  <span className="day-label day-label--compact">{getCompactDayLabel(day)}</span>
                </div>
              ))}
            </div>
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
              dayWidths={dayWidths}
              cumulativeOffsets={cumulativeOffsets}
              totalTimelineWidth={totalTimelineWidth}
              onTaskSelect={setSelectedTask}
              onEmployeeSelect={setSelectedEmployeeId}
            />
          ))
        )}
      </div>

      <TaskDetailsModal
        task={selectedTask}
        taskTitleById={taskTitleById}
        onClose={() => setSelectedTask(null)}
      />

      <EmployeeDetailsModal
        employee={selectedEmployee}
        tasks={selectedEmployeeTasks}
        timelineStartDate={timelineStartDate}
        timelineDays={timelineDays}
        onClose={() => setSelectedEmployeeId(null)}
      />
    </div>
  );
};
