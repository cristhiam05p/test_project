import type { WorkPackage } from "../types/workPackage";
import type { EmployeeGroup } from "../utils/timelineUtils";
import { EmployeeRow } from "./EmployeeRow";

interface DepartmentSectionProps {
  department: string;
  employees: EmployeeGroup[];
  timelineStartDate: string;
  timelineDays: number;
  dayWidths: number[];
  cumulativeOffsets: number[];
  totalTimelineWidth: number;
  nonWorkingDayByIndex: boolean[];
  onTaskSelect: (task: WorkPackage) => void;
  onEmployeeSelect: (employeeId: string) => void;
}

export const DepartmentSection = ({
  department,
  employees,
  timelineStartDate,
  timelineDays,
  dayWidths,
  cumulativeOffsets,
  totalTimelineWidth,
  nonWorkingDayByIndex,
  onTaskSelect,
  onEmployeeSelect,
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
          dayWidths={dayWidths}
          cumulativeOffsets={cumulativeOffsets}
          totalTimelineWidth={totalTimelineWidth}
          nonWorkingDayByIndex={nonWorkingDayByIndex}
          onTaskSelect={onTaskSelect}
          onEmployeeSelect={() => onEmployeeSelect(employee.employeeId)}
        />
      ))}
    </section>
  );
};
