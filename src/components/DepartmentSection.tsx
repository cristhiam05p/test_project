import type { WorkPackage } from '../types/workPackage';
import type { EmployeeGroup } from '../utils/timelineUtils';
import { EmployeeRow } from './EmployeeRow';

interface DepartmentSectionProps {
  department: string;
  employees: EmployeeGroup[];
  timelineStartDate: string;
  timelineDays: number;
  dayWidth: number;
  onTaskSelect: (task: WorkPackage) => void;
}

export const DepartmentSection = ({
  department,
  employees,
  timelineStartDate,
  timelineDays,
  dayWidth,
  onTaskSelect,
}: DepartmentSectionProps) => {
  return (
    <section className="department-section">
      <h2>{department}</h2>
      {employees.map((employee) => (
        <EmployeeRow
          key={employee.employeeId}
          employeeName={employee.employeeName}
          tasks={employee.tasks}
          timelineStartDate={timelineStartDate}
          timelineDays={timelineDays}
          dayWidth={dayWidth}
          onTaskSelect={onTaskSelect}
        />
      ))}
    </section>
  );
};
