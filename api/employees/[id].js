import { getStore } from '../../lib/store.js';
import { isNonNegativeNumber, parseBody, parseId, sendMethodNotAllowed } from '../../lib/api.js';

export default async function handler(req, res) {
  const store = getStore();
  const employee = store.employees.find((item) => item.id === parseId(req));

  if (!employee) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(employee);
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    if (!body) return res.status(400).json({ error: 'Invalid body.' });

    if (body.departmentId !== undefined && !store.departments.some((department) => department.id === body.departmentId)) {
      return res.status(400).json({ error: 'Employee.departmentId must exist.' });
    }

    if (body.capacityHoursPerWeek !== undefined && !isNonNegativeNumber(body.capacityHoursPerWeek)) {
      return res.status(400).json({ error: 'capacityHoursPerWeek must be >= 0.' });
    }

    if (body.costPerHour !== undefined && !isNonNegativeNumber(body.costPerHour)) {
      return res.status(400).json({ error: 'costPerHour must be >= 0.' });
    }

    Object.assign(employee, {
      ...(body.fullName !== undefined ? { fullName: body.fullName.trim() } : {}),
      ...(body.departmentId !== undefined ? { departmentId: body.departmentId } : {}),
      ...(body.capacityHoursPerWeek !== undefined ? { capacityHoursPerWeek: body.capacityHoursPerWeek } : {}),
      ...(body.costPerHour !== undefined ? { costPerHour: body.costPerHour } : {}),
      ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
    });

    return res.status(200).json(employee);
  }

  if (req.method === 'DELETE') {
    employee.isActive = false;
    return res.status(200).json(employee);
  }

  return sendMethodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
}
