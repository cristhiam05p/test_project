import { getStore, id, taskStatuses } from '../../lib/store.js';
import { isNonNegativeNumber, parseBody, sendMethodNotAllowed, validateDateRange } from '../../lib/api.js';

export default async function handler(req, res) {
  const store = getStore();

  if (req.method === 'GET') {
    return res.status(200).json(store.tasks);
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    if (!body || typeof body.title !== 'string' || !body.title.trim()) {
      return res.status(400).json({ error: 'title is required.' });
    }

    if (!store.projects.some((project) => project.id === body.projectId)) {
      return res.status(400).json({ error: 'Task.projectId must exist.' });
    }

    if (!store.departments.some((department) => department.id === body.departmentId)) {
      return res.status(400).json({ error: 'Task.departmentId must exist.' });
    }

    const dateCheck = validateDateRange(body.startDate, body.endDate);
    if (!dateCheck.ok) return res.status(400).json({ error: dateCheck.error });

    if (!isNonNegativeNumber(body.estimatedHours ?? 0)) {
      return res.status(400).json({ error: 'estimatedHours must be >= 0.' });
    }

    if (body.status !== undefined && !taskStatuses.includes(body.status)) {
      return res.status(400).json({ error: 'status must be a valid enum value.' });
    }

    if (body.priority !== undefined && (!Number.isInteger(body.priority) || body.priority < 1 || body.priority > 5)) {
      return res.status(400).json({ error: 'priority must be between 1 and 5.' });
    }

    const task = {
      id: id('tsk', store),
      title: body.title.trim(),
      description: body.description ?? null,
      projectId: body.projectId,
      departmentId: body.departmentId,
      startDate: dateCheck.start,
      endDate: dateCheck.end,
      estimatedHours: body.estimatedHours ?? 0,
      status: body.status ?? 'PLANNED',
      priority: body.priority ?? null,
      isActive: true,
    };

    store.tasks.push(task);
    return res.status(201).json(task);
  }

  return sendMethodNotAllowed(res, ['GET', 'POST']);
}
