import { getStore } from '../../lib/store.js';
import { parseBody, parseId, sendMethodNotAllowed } from '../../lib/api.js';

export default async function handler(req, res) {
  const store = getStore();
  const recordId = parseId(req);
  const department = store.departments.find((item) => item.id === recordId);

  if (!department) {
    return res.status(404).json({ error: 'Department not found.' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(department);
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    if (!body) return res.status(400).json({ error: 'Invalid body.' });

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return res.status(400).json({ error: 'name must be a non-empty string.' });
      }

      const duplicate = store.departments.some(
        (item) => item.id !== recordId && item.name.toLowerCase() === body.name.trim().toLowerCase(),
      );
      if (duplicate) {
        return res.status(409).json({ error: 'Department.name must be unique.' });
      }

      department.name = body.name.trim();
    }

    if (typeof body.isActive === 'boolean') {
      department.isActive = body.isActive;
    }

    return res.status(200).json(department);
  }

  if (req.method === 'DELETE') {
    department.isActive = false;
    return res.status(200).json(department);
  }

  return sendMethodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
}
