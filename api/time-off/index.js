import { getStore, id, timeOffTypes } from '../../lib/store.js';
import { parseBody, sendMethodNotAllowed, validateDateRange } from '../../lib/api.js';

export default async function handler(req, res) {
  const store = getStore();

  if (req.method === 'GET') {
    return res.status(200).json(store.timeOff);
  }

  if (req.method === 'POST') {
    const body = parseBody(req);

    if (!body || typeof body.employeeId !== 'string') {
      return res.status(400).json({ error: 'employeeId is required.' });
    }

    if (!store.employees.some((employee) => employee.id === body.employeeId)) {
      return res.status(400).json({ error: 'employeeId must exist.' });
    }

    if (!timeOffTypes.includes(body.type)) {
      return res.status(400).json({ error: 'type must be a valid enum value.' });
    }

    const dateCheck = validateDateRange(body.startDate, body.endDate);
    if (!dateCheck.ok) return res.status(400).json({ error: dateCheck.error });

    const entry = {
      id: id('to', store),
      employeeId: body.employeeId,
      startDate: dateCheck.start,
      endDate: dateCheck.end,
      type: body.type,
      notes: body.notes ?? null,
    };
    store.timeOff.push(entry);

    return res.status(201).json(entry);
  }

  return sendMethodNotAllowed(res, ['GET', 'POST']);
}
