import { getStore } from '../../lib/store.js';
import { parseBody, parseId, sendMethodNotAllowed } from '../../lib/api.js';

const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export default async function handler(req, res) {
  const store = getStore();
  const project = store.projects.find((item) => item.id === parseId(req));

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(project);
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    if (!body) return res.status(400).json({ error: 'Invalid body.' });

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return res.status(400).json({ error: 'name must be a non-empty string.' });
      }
      const duplicate = store.projects.some((item) => item.id !== project.id && item.name.toLowerCase() === body.name.trim().toLowerCase());
      if (duplicate) {
        return res.status(409).json({ error: 'Project.name must be unique.' });
      }
      project.name = body.name.trim();
    }

    if (body.color !== undefined && (typeof body.color !== 'string' || !hexColorRegex.test(body.color))) {
      return res.status(400).json({ error: 'color must be a valid hex code.' });
    }

    Object.assign(project, {
      ...(body.color !== undefined ? { color: body.color } : {}),
      ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
    });

    return res.status(200).json(project);
  }

  if (req.method === 'DELETE') {
    project.isActive = false;
    return res.status(200).json(project);
  }

  return sendMethodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
}
