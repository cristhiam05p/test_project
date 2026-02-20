import { getStore, taskStatuses } from '../../lib/store.js';
import { isNonNegativeNumber, parseBody, parseId, sendMethodNotAllowed, validateDateRange } from '../../lib/api.js';

export default async function handler(req, res) {
  const store = getStore();
  const task = store.tasks.find((item) => item.id === parseId(req));

  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(task);
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    if (!body) return res.status(400).json({ error: 'Invalid body.' });

    if (body.projectId !== undefined && !store.projects.some((project) => project.id === body.projectId)) {
      return res.status(400).json({ error: 'Task.projectId must exist.' });
    }

    if (body.departmentId !== undefined && !store.departments.some((department) => department.id === body.departmentId)) {
      return res.status(400).json({ error: 'Task.departmentId must exist.' });
    }

    if (body.estimatedHours !== undefined && !isNonNegativeNumber(body.estimatedHours)) {
      return res.status(400).json({ error: 'estimatedHours must be >= 0.' });
    }

    if (body.status !== undefined && !taskStatuses.includes(body.status)) {
      return res.status(400).json({ error: 'status must be a valid enum value.' });
    }

    const startDate = body.startDate ?? task.startDate;
    const endDate = body.endDate ?? task.endDate;
    const dateCheck = validateDateRange(startDate, endDate);
    if (!dateCheck.ok) return res.status(400).json({ error: dateCheck.error });

    Object.assign(task, {
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.projectId !== undefined ? { projectId: body.projectId } : {}),
      ...(body.departmentId !== undefined ? { departmentId: body.departmentId } : {}),
      ...(body.estimatedHours !== undefined ? { estimatedHours: body.estimatedHours } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
      startDate: dateCheck.start,
      endDate: dateCheck.end,
    });

    return res.status(200).json(task);
  }

  if (req.method === 'DELETE') {
    if (store.taskAssignments.some((assignment) => assignment.taskId === task.id)) {
      return res.status(409).json({ error: 'Task cannot be deleted because it has assignments.' });
    }

    store.tasks = store.tasks.filter((item) => item.id !== task.id);
    return res.status(204).end();
  }

  return sendMethodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
}
