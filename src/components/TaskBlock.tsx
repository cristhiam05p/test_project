import type { WorkPackage } from "../types/workPackage";
import { getTaskOffsetDays } from "../utils/timelineUtils";

interface TaskBlockProps {
  task: WorkPackage;
  timelineStartDate: string;
  dayWidth: number;
  onSelect: (task: WorkPackage) => void;
}

export const TaskBlock = ({
  task,
  timelineStartDate,
  dayWidth,
  onSelect,
}: TaskBlockProps) => {
  const left =
    getTaskOffsetDays(timelineStartDate, task.scheduledStartDate) * dayWidth;
  const width = task.durationDays * dayWidth;

  return (
    <button
      className="task-block"
      style={{ left, width, background: task.projectColor }}
      onClick={() => onSelect(task)}
      title={`${task.title} (${task.projectName})`}
      type="button"
    >
      <span className="task-block-title">{task.title}</span>
      <span className="task-block-project">{task.projectName}</span>
    </button>
  );
};
