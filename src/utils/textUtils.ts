export const normalizeText = (value: string): string => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const levenshteinDistance = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + substitutionCost,
      );
    }
  }

  return matrix[a.length][b.length];
};

export const includesNormalized = (target: string, query: string): boolean => {
  const normalizedQuery = normalizeText(query.trim());
  if (!normalizedQuery) {
    return true;
  }

  const normalizedTarget = normalizeText(target);
  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }

  return normalizedTarget.split(/\s+/).some((token) => {
    if (Math.abs(token.length - normalizedQuery.length) > 1) {
      return false;
    }
    return levenshteinDistance(token, normalizedQuery) <= 1;
  });
};
