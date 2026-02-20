import { getStore, id } from '../../lib/store.js';
import { parseBody, sendMethodNotAllowed } from '../../lib/api.js';

const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export default async function handler(req, res) {
  const store = getStore();

  if (req.method === 'GET') {
    return res.status(200).json(store.projects);
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    if (!body || typeof body.name !== 'string' || !body.name.trim()) {
      return res.status(400).json({ error: 'name is required.' });
    }

    const name = body.name.trim();
    if (store.projects.some((project) => project.name.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ error: 'Project.name must be unique.' });
    }

    if (body.color !== undefined && (typeof body.color !== 'string' || !hexColorRegex.test(body.color))) {
      return res.status(400).json({ error: 'color must be a valid hex code.' });
    }

    const project = { id: id('pro', store), name, color: body.color ?? null, isActive: true };
    store.projects.push(project);
    return res.status(201).json(project);
  }

  return sendMethodNotAllowed(res, ['GET', 'POST']);
}
