import type { WorkPackage } from '../types/workPackage';

interface TaskDetailsModalProps {
  task: WorkPackage | null;
  taskTitleById: Map<string, string>;
  onClose: () => void;
}

export const TaskDetailsModal = ({ task, taskTitleById, onClose }: TaskDetailsModalProps) => {
  if (!task) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <aside className="modal-panel" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" onClick={onClose} type="button">
          ✕
        </button>
        <h3>{task.title}</h3>
        <p>{task.description}</p>

        <dl>
          <dt>Proyecto</dt>
          <dd>
            {task.projectName} ({task.projectId})
          </dd>

          <dt>Fecha programada</dt>
          <dd>{task.scheduledStartDate}</dd>

          <dt>Inicio más temprano</dt>
          <dd>{task.earliestStartDate}</dd>

          <dt className="deadline">Fecha límite</dt>
          <dd className="deadline">{task.deadlineDate}</dd>

          <dt>Duración (días)</dt>
          <dd>{task.durationDays}</dd>

          <dt>Dependencias</dt>
          <dd>
            {task.dependencies.length === 0 ? (
              'Sin dependencias'
            ) : (
              <ul>
                {task.dependencies.map((dependency) => (
                  <li key={`${dependency.type}-${dependency.taskId}`}>
                    {dependency.type} → {dependency.taskId}
                    {taskTitleById.has(dependency.taskId)
                      ? ` (${taskTitleById.get(dependency.taskId)})`
                      : ''}
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </dl>
      </aside>
    </div>
  );
};
