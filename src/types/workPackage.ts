export type DependencyType = 'FS' | 'SS';

export interface WorkDependency {
  type: DependencyType;
  taskId: string;
}

export interface WorkPackage {
  id: string;
  projectId: string;
  projectName: string;
  department: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  earliestStartDate: string;
  deadlineDate: string;
  durationDays: number;
  scheduledStartDate: string;
  dependencies: WorkDependency[];
}
