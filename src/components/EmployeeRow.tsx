import type { WorkPackage } from "../types/workPackage";
import { TaskBlock } from "./TaskBlock";

interface EmployeeRowProps {
  employeeName: string;
  tasks: WorkPackage[];
  timelineStartDate: string;
  timelineDays: number;
  dayWidths: number[];
  cumulativeOffsets: number[];
  totalTimelineWidth: number;
  nonWorkingDayByIndex: boolean[];
  onTaskSelect: (task: WorkPackage) => void;
  onEmployeeSelect: () => void;
}

export const EmployeeRow = ({
  employeeName,
  tasks,
  timelineStartDate,
  timelineDays,
  dayWidths,
  cumulativeOffsets,
  totalTimelineWidth,
  nonWorkingDayByIndex,
  onTaskSelect,
  onEmployeeSelect,
}: EmployeeRowProps) => {
  return (
    <div className="employee-row">
      <button className="employee-label employee-button" onClick={onEmployeeSelect} type="button">
        {employeeName}
      </button>
      <div className="employee-timeline" style={{ width: totalTimelineWidth }}>
        {Array.from({ length: timelineDays }, (_, index) => (
          <div
            key={index}
            className={`day-cell ${nonWorkingDayByIndex[index] ? "non-working-day" : ""}`}
            style={{ width: dayWidths[index], left: cumulativeOffsets[index] }}
          />
        ))}
        {tasks.map((task) => (
          <TaskBlock
            key={task.id}
            task={task}
            timelineStartDate={timelineStartDate}
            dayWidth={dayWidths[0]}
            dayWidths={dayWidths}
            cumulativeOffsets={cumulativeOffsets}
            onSelect={onTaskSelect}
          />
        ))}
      </div>
    </div>
  );
};
