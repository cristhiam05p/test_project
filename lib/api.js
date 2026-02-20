export function sendMethodNotAllowed(res, allowedMethods) {
  res.setHeader('Allow', allowedMethods);
  return res.status(405).json({ error: `Method not allowed. Use: ${allowedMethods.join(', ')}` });
}

export function parseId(req) {
  return req.query.id;
}

export function parseBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return req.body;
}

export function isNonNegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { ok: false, error: 'startDate and endDate must be valid ISO dates.' };
  }

  if (end < start) {
    return { ok: false, error: 'endDate must be greater than or equal to startDate.' };
  }

  return { ok: true, start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export function conflict(res, message) {
  return res.status(409).json({ error: message });
}
