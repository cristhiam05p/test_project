import { getStore, id } from '../../lib/store.js';
import { isNonNegativeNumber, parseBody, sendMethodNotAllowed } from '../../lib/api.js';

export default async function handler(req, res) {
  const store = getStore();

  if (req.method === 'GET') {
    return res.status(200).json(store.employees);
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    if (!body || typeof body.fullName !== 'string' || !body.fullName.trim() || typeof body.departmentId !== 'string') {
      return res.status(400).json({ error: 'fullName and departmentId are required.' });
    }

    if (!store.departments.some((department) => department.id === body.departmentId)) {
      return res.status(400).json({ error: 'Employee.departmentId must exist.' });
    }

    if (body.capacityHoursPerWeek !== undefined && !isNonNegativeNumber(body.capacityHoursPerWeek)) {
      return res.status(400).json({ error: 'capacityHoursPerWeek must be >= 0.' });
    }

    if (body.costPerHour !== undefined && !isNonNegativeNumber(body.costPerHour)) {
      return res.status(400).json({ error: 'costPerHour must be >= 0.' });
    }

    const employee = {
      id: id('emp', store),
      fullName: body.fullName.trim(),
      departmentId: body.departmentId,
      capacityHoursPerWeek: body.capacityHoursPerWeek ?? 40,
      costPerHour: body.costPerHour ?? null,
      isActive: true,
    };

    store.employees.push(employee);
    return res.status(201).json(employee);
  }

  return sendMethodNotAllowed(res, ['GET', 'POST']);
}
