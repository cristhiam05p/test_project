import { getStore, id } from '../../lib/store.js';
import { parseBody, sendMethodNotAllowed } from '../../lib/api.js';

export default async function handler(req, res) {
  const store = getStore();

  if (req.method === 'GET') {
    return res.status(200).json(store.departments);
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    if (!body || typeof body.name !== 'string' || !body.name.trim()) {
      return res.status(400).json({ error: 'name is required.' });
    }

    const name = body.name.trim();
    if (store.departments.some((department) => department.name.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ error: 'Department.name must be unique.' });
    }

    const department = { id: id('dep', store), name, isActive: true };
    store.departments.push(department);
    return res.status(201).json(department);
  }

  return sendMethodNotAllowed(res, ['GET', 'POST']);
}
