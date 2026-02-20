import { getStore } from '../../lib/store.js';
import { isNonNegativeNumber, parseBody, parseId, sendMethodNotAllowed } from '../../lib/api.js';

export default async function handler(req, res) {
  const store = getStore();
  const assignment = store.taskAssignments.find((item) => item.id === parseId(req));

  if (!assignment) {
    return res.status(404).json({ error: 'TaskAssignment not found.' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(assignment);
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    if (!body) return res.status(400).json({ error: 'Invalid body.' });

    if (body.allocationHours !== undefined && !isNonNegativeNumber(body.allocationHours)) {
      return res.status(400).json({ error: 'allocationHours must be >= 0.' });
    }

    const nextTaskId = body.taskId ?? assignment.taskId;
    const nextEmployeeId = body.employeeId ?? assignment.employeeId;

    if (store.taskAssignments.some((item) => item.id !== assignment.id && item.taskId === nextTaskId && item.employeeId === nextEmployeeId)) {
      return res.status(409).json({ error: 'TaskAssignment (taskId, employeeId) must be unique.' });
    }

    Object.assign(assignment, {
      ...(body.taskId !== undefined ? { taskId: body.taskId } : {}),
      ...(body.employeeId !== undefined ? { employeeId: body.employeeId } : {}),
      ...(body.allocationHours !== undefined ? { allocationHours: body.allocationHours } : {}),
    });

    return res.status(200).json(assignment);
  }

  if (req.method === 'DELETE') {
    store.taskAssignments = store.taskAssignments.filter((item) => item.id !== assignment.id);
    return res.status(204).end();
  }

  return sendMethodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
}
