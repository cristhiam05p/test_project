import type { WorkPackage } from "../types/workPackage";
import { addWorkingDays, differenceInDays, toDate } from "../utils/dateUtils";
import { getTaskOffsetDays } from "../utils/timelineUtils";

interface TaskBlockProps {
  task: WorkPackage;
  timelineStartDate: string;
  dayWidth: number;
  dayWidths?: number[];
  cumulativeOffsets?: number[];
  onSelect: (task: WorkPackage) => void;
}

export const TaskBlock = ({
  task,
  timelineStartDate,
  dayWidth,
  dayWidths,
  cumulativeOffsets,
  onSelect,
}: TaskBlockProps) => {
  const startOffset = getTaskOffsetDays(timelineStartDate, task.scheduledStartDate);
  const hasVariableWidths = dayWidths && cumulativeOffsets && dayWidths.length > 0;
  const taskStart = toDate(task.scheduledStartDate);
  const taskEndExclusive = addWorkingDays(taskStart, task.durationDays);
  const taskSpanDays = Math.max(1, differenceInDays(taskStart, taskEndExclusive));

  const left = hasVariableWidths
    ? cumulativeOffsets[Math.max(0, startOffset)] ?? 0
    : startOffset * dayWidth;

  const width = hasVariableWidths
    ? Array.from({ length: taskSpanDays }, (_, index) => dayWidths[startOffset + index] ?? 0).reduce(
        (total, current) => total + current,
        0,
      )
    : taskSpanDays * dayWidth;

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
