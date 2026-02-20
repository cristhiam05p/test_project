import type { WorkPackage } from '../types/workPackage';
import { differenceInDays, toDate } from './dateUtils';

export interface EmployeeGroup {
  employeeId: string;
  employeeName: string;
  tasks: WorkPackage[];
}

export interface DepartmentGroup {
  department: string;
  employees: EmployeeGroup[];
}

export const groupByDepartmentAndEmployee = (tasks: WorkPackage[]): DepartmentGroup[] => {
  const departments = new Map<string, Map<string, EmployeeGroup>>();

  tasks.forEach((task) => {
    if (!departments.has(task.department)) {
      departments.set(task.department, new Map());
    }

    const employees = departments.get(task.department)!;
    if (!employees.has(task.employeeId)) {
      employees.set(task.employeeId, {
        employeeId: task.employeeId,
        employeeName: task.employeeName,
        tasks: [],
      });
    }

    employees.get(task.employeeId)!.tasks.push(task);
  });

  return [...departments.entries()].map(([department, employeeMap]) => ({
    department,
    employees: [...employeeMap.values()].map((employee) => ({
      ...employee,
      tasks: employee.tasks.sort((a, b) =>
        toDate(a.scheduledStartDate).getTime() - toDate(b.scheduledStartDate).getTime(),
      ),
    })),
  }));
};

export const getTaskOffsetDays = (timelineStartDate: string, taskStartDate: string): number => {
  return differenceInDays(toDate(timelineStartDate), toDate(taskStartDate));
};
