import { getStore, timeOffTypes } from '../../lib/store.js';
import { parseBody, parseId, sendMethodNotAllowed, validateDateRange } from '../../lib/api.js';

export default async function handler(req, res) {
  const store = getStore();
  const entry = store.timeOff.find((item) => item.id === parseId(req));

  if (!entry) {
    return res.status(404).json({ error: 'TimeOff not found.' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(entry);
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    if (!body) return res.status(400).json({ error: 'Invalid body.' });

    if (body.type !== undefined && !timeOffTypes.includes(body.type)) {
      return res.status(400).json({ error: 'type must be a valid enum value.' });
    }

    const dateCheck = validateDateRange(body.startDate ?? entry.startDate, body.endDate ?? entry.endDate);
    if (!dateCheck.ok) return res.status(400).json({ error: dateCheck.error });

    Object.assign(entry, {
      ...(body.employeeId !== undefined ? { employeeId: body.employeeId } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      startDate: dateCheck.start,
      endDate: dateCheck.end,
    });

    return res.status(200).json(entry);
  }

  if (req.method === 'DELETE') {
    store.timeOff = store.timeOff.filter((item) => item.id !== entry.id);
    return res.status(204).end();
  }

  return sendMethodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
}
