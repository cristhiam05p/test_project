import {
  addDays,
  addWorkingDays,
  formatISODate,
  getNextWorkingDay,
  isWorkingDay,
  toDate,
} from "../utils/dateUtils";
import type { WorkPackage } from "../types/workPackage";

export interface EmployeeProfile {
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  hourlyCost: number;
  weeklyCapacityHours: number;
  absences: { startDate: string; endDate: string; reason: string }[];
}

export const demoStartDate = "2026-02-02";
export const timelineWeeks = 12;

export const projectCatalog = {
  "P-RHEIN": { name: "Project Rhein", color: "#2563eb" },
  "P-ANDEN": { name: "Project Anden", color: "#0f766e" },
  "P-AURORA": { name: "Project Aurora", color: "#7c3aed" },
  "P-ATLAS": { name: "Project Atlas", color: "#c2410c" },
  "P-DELTA": { name: "Project Delta", color: "#db2777" },
  "P-NOVA": { name: "Project Nova", color: "#0891b2" },
} as const;

type ProjectId = keyof typeof projectCatalog;

const departments = [
  {
    name: "Hardware",
    roles: ["Electronics Engineer", "PCB Designer", "Validation Engineer"],
    employees: [
      "María Rojas",
      "Luis Mendoza",
      "Ana Pardo",
      "Renata Blanco",
      "Iván Cornejo",
    ],
  },
  {
    name: "Software",
    roles: ["Firmware Engineer", "Backend Engineer", "Frontend Engineer"],
    employees: [
      "Diego León",
      "Sofía Nieto",
      "Carlos Núñez",
      "Tomás Vera",
      "Elisa Cárdenas",
    ],
  },
  {
    name: "Producción",
    roles: ["Process Engineer", "Quality Analyst", "Operations Lead"],
    employees: [
      "Elena Torres",
      "Jorge Vidal",
      "Valeria Solís",
      "Martín Cuevas",
      "Nadia Vega",
    ],
  },
  {
    name: "QA",
    roles: ["QA Analyst", "Automation Engineer", "Reliability Engineer"],
    employees: [
      "Gabriela Soto",
      "Leandro Flores",
      "Pilar Reyes",
      "Sebastián Ocampo",
    ],
  },
  {
    name: "Diseño",
    roles: ["UX Designer", "UI Designer", "Service Designer"],
    employees: ["Paula Ibáñez", "Nicolás Araya", "Milena Torres", "Raúl Pino"],
  },
] as const;

const taskTopics = [
  "Integración módulo",
  "Refactor de flujo",
  "Plan de validación",
  "Diseño de interfaz",
  "Pruebas de carga",
  "Ajustes de arquitectura",
  "Automatización de checklist",
  "Optimización de pipeline",
  "Documentación operativa",
  "Análisis de riesgos",
] as const;

const taskDescriptions = [
  "Alineación con stakeholders y definición de entregables del sprint.",
  "Implementación incremental con foco en estabilidad y mantenibilidad.",
  "Cobertura de casos borde y definición de criterios de aceptación.",
  "Revisión cruzada entre equipos para minimizar bloqueos de dependencia.",
  "Preparación de demo ejecutiva con indicadores de avance.",
] as const;

const createSeededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

const rng = createSeededRandom(24022026);

const randomInt = (min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

const pickOne = <T,>(items: readonly T[]): T => {
  const index = Math.floor(rng() * items.length);
  return items[index];
};

const projectIds = Object.keys(projectCatalog) as ProjectId[];
const TOTAL_TIMELINE_DAYS = timelineWeeks * 7;

interface TaskSpan {
  start: Date;
  endExclusive: Date;
}

const getTaskEndExclusive = (start: Date, durationDays: number): Date => {
  return addWorkingDays(start, durationDays);
};

const hasOverlap = (employeeTasks: TaskSpan[], candidate: TaskSpan): boolean => {
  return employeeTasks.some(
    (task) => candidate.start < task.endExclusive && candidate.endExclusive > task.start,
  );
};

const placeTaskWithoutOverlap = (
  existingTasks: TaskSpan[],
  timelineStart: Date,
  durationDays: number,
): Date => {
  const maxOffset = Math.max(0, TOTAL_TIMELINE_DAYS - 10);

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const startOffset = randomInt(0, maxOffset);
    const candidateStart = getNextWorkingDay(addDays(timelineStart, startOffset));
    const candidateSpan: TaskSpan = {
      start: candidateStart,
      endExclusive: getTaskEndExclusive(candidateStart, durationDays),
    };

    if (!hasOverlap(existingTasks, candidateSpan)) {
      return candidateStart;
    }
  }

  const sortedTasks = [...existingTasks].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );
  const tailDate = sortedTasks.length > 0 ? sortedTasks[sortedTasks.length - 1].endExclusive : timelineStart;
  return getNextWorkingDay(tailDate);
};

const buildEmployeeProfiles = (): EmployeeProfile[] => {
  const output: EmployeeProfile[] = [];

  departments.forEach((department, departmentIndex) => {
    department.employees.forEach((employeeName, employeeIndex) => {
      const employeeId = `EMP-${department.name.slice(0, 2).toUpperCase()}-${String(employeeIndex + 1).padStart(2, "0")}`;
      const weeklyCapacityHours = randomInt(34, 40);
      const absenceStart = addDays(toDate(demoStartDate), randomInt(7, 60));

      output.push({
        employeeId,
        employeeName,
        department: department.name,
        role: department.roles[(employeeIndex + departmentIndex) % department.roles.length],
        hourlyCost: randomInt(28, 64),
        weeklyCapacityHours,
        absences:
          rng() > 0.45
            ? [
                {
                  startDate: formatISODate(absenceStart),
                  endDate: formatISODate(addDays(absenceStart, randomInt(1, 3))),
                  reason: pickOne(["Vacaciones", "Formación", "Permiso"]) as string,
                },
              ]
            : [],
      });
    });
  });

  return output;
};

export const employeeProfiles = buildEmployeeProfiles();

const withProject = (
  projectId: ProjectId,
  task: Omit<WorkPackage, "projectId" | "projectName" | "projectColor">,
): WorkPackage => ({
  ...task,
  projectId,
  projectName: projectCatalog[projectId].name,
  projectColor: projectCatalog[projectId].color,
});

export const workPackages: WorkPackage[] = employeeProfiles.flatMap((employee) => {
  const taskCount = randomInt(4, 8);
  const employeeTimelineStart = toDate(demoStartDate);
  const placedTasks: TaskSpan[] = [];

  return Array.from({ length: taskCount }, (_, taskIndex) => {
    const projectId = pickOne(projectIds);
    const durationDays = randomInt(2, 6);
    const startDate = placeTaskWithoutOverlap(
      placedTasks,
      employeeTimelineStart,
      durationDays,
    );
    const endExclusive = getTaskEndExclusive(startDate, durationDays);
    const dependencyTaskId = taskIndex > 0 ? `${employee.employeeId}-TSK-${taskIndex}` : null;

    placedTasks.push({ start: startDate, endExclusive });

    const earliestCandidate = addWorkingDays(startDate, -randomInt(0, 2));
    const earliestStartDate = isWorkingDay(earliestCandidate)
      ? earliestCandidate
      : getNextWorkingDay(earliestCandidate);
    const deadlineDate = addWorkingDays(endExclusive, randomInt(1, 5));

    return withProject(projectId, {
      id: `${employee.employeeId}-TSK-${taskIndex + 1}`,
      department: employee.department,
      employeeId: employee.employeeId,
      employeeName: employee.employeeName,
      title: `${pickOne(taskTopics)} ${taskIndex + 1}`,
      description: `${pickOne(taskDescriptions)} Equipo: ${employee.department}.`,
      earliestStartDate: formatISODate(earliestStartDate),
      deadlineDate: formatISODate(deadlineDate),
      durationDays,
      scheduledStartDate: formatISODate(startDate),
      dependencies: dependencyTaskId ? [{ type: pickOne(["FS", "SS"]), taskId: dependencyTaskId }] : [],
    });
  });
});
