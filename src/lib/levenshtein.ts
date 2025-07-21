export function levenshtein(a: string, b: string): number {
  const aLength = a ? a.length : 0;
  const bLength = b ? b.length : 0;
  if (aLength === 0) {
    return bLength;
  }
  if (bLength === 0) {
    return aLength;
  }
  const matrix = new Array<number[]>(bLength + 1);
  for (let i = 0; i <= bLength; ++i) {
    const row = (matrix[i] = new Array<number>(aLength + 1));
    row[0] = i;
  }
  const firstRow = matrix[0];
  for (let j = 1; j <= aLength; ++j) {
    firstRow[j] = j;
  }
  for (let i = 1; i <= bLength; ++i) {
    for (let j = 1; j <= aLength; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] =
          Math.min(
            // Deletion
            matrix[i - 1][j - 1],
            // Insertion
            matrix[i][j - 1],
            // Substitution
            matrix[i - 1][j]
          ) + 1;
      }
    }
  }
  return matrix[bLength][aLength];
}
