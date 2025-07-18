export const parseTime = (timeStr: string, duration?: number): number => {
  if (timeStr.endsWith('%')) {
    if (duration === undefined) {
      throw new Error('Duration is required for percentage-based time');
    }
    return duration * parseFloat(timeStr.slice(0, -1)) / 100;
  }

  const match = timeStr.match(/^(\d+(?:\.\d+)?)([smh]?)$/);
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  const value = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
    case '':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
};
