import { getStore, id } from '../../lib/store.js';
import { isNonNegativeNumber, parseBody, sendMethodNotAllowed } from '../../lib/api.js';

export default async function handler(req, res) {
  const store = getStore();

  if (req.method === 'GET') {
    return res.status(200).json(store.taskAssignments);
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    if (!body || typeof body.taskId !== 'string' || typeof body.employeeId !== 'string') {
      return res.status(400).json({ error: 'taskId and employeeId are required.' });
    }

    if (!store.tasks.some((task) => task.id === body.taskId)) {
      return res.status(400).json({ error: 'taskId must exist.' });
    }

    if (!store.employees.some((employee) => employee.id === body.employeeId)) {
      return res.status(400).json({ error: 'employeeId must exist.' });
    }

    if (!isNonNegativeNumber(body.allocationHours)) {
      return res.status(400).json({ error: 'allocationHours must be >= 0.' });
    }

    if (store.taskAssignments.some((item) => item.taskId === body.taskId && item.employeeId === body.employeeId)) {
      return res.status(409).json({ error: 'TaskAssignment (taskId, employeeId) must be unique.' });
    }

    const assignment = { id: id('asg', store), taskId: body.taskId, employeeId: body.employeeId, allocationHours: body.allocationHours };
    store.taskAssignments.push(assignment);

    return res.status(201).json(assignment);
  }

  return sendMethodNotAllowed(res, ['GET', 'POST']);
}
