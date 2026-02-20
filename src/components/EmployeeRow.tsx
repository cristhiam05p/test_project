import type { WorkPackage } from '../types/workPackage';
import { TaskBlock } from './TaskBlock';

interface EmployeeRowProps {
  employeeName: string;
  tasks: WorkPackage[];
  timelineStartDate: string;
  timelineDays: number;
  dayWidth: number;
  onTaskSelect: (task: WorkPackage) => void;
}

export const EmployeeRow = ({
  employeeName,
  tasks,
  timelineStartDate,
  timelineDays,
  dayWidth,
  onTaskSelect,
}: EmployeeRowProps) => {
  return (
    <div className="employee-row">
      <div className="employee-label">{employeeName}</div>
      <div className="employee-timeline" style={{ width: dayWidth * timelineDays }}>
        {Array.from({ length: timelineDays }, (_, index) => (
          <div key={index} className="day-cell" style={{ width: dayWidth }} />
        ))}
        {tasks.map((task) => (
          <TaskBlock
            key={task.id}
            task={task}
            timelineStartDate={timelineStartDate}
            dayWidth={dayWidth}
            onSelect={onTaskSelect}
          />
        ))}
      </div>
    </div>
  );
};
