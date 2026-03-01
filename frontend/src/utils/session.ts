  export const getTimeUntilSession = (sessionDate: string) => {
    const sessionTime = new Date(sessionDate).getTime();
    const now = Date.now();
    const hoursUntil = (sessionTime - now) / (1000 * 60 * 60);
    return hoursUntil;
  };

  export const isWithin24Hours = (sessionDate: string) => {
    const hoursUntil = getTimeUntilSession(sessionDate);
    // Only true for future sessions less than 24h away, not past sessions
    return hoursUntil > 0 && hoursUntil < 24;
  };

  export const formatTimeUntilSession = (sessionDate: string) => {
    const hoursUntil = getTimeUntilSession(sessionDate);

    if (hoursUntil < 0) {
      const hoursAgo = Math.abs(hoursUntil);
      if (hoursAgo < 1) {
        return `${Math.floor(hoursAgo * 60)} minutes ago`;
      }
      return `${Math.floor(hoursAgo)} hour${Math.floor(hoursAgo) !== 1 ? "s" : ""} ago`;
    } else if (hoursUntil < 1) {
      const minutesUntil = Math.floor(hoursUntil * 60);
      return `${minutesUntil} minute${minutesUntil !== 1 ? "s" : ""}`;
    } else if (hoursUntil < 24) {
      const hours = Math.floor(hoursUntil);
      const minutes = Math.floor((hoursUntil - hours) * 60);
      if (minutes > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      const daysUntil = Math.floor(hoursUntil / 24);
      const remainingHours = Math.floor(hoursUntil % 24);
      if (remainingHours > 0) {
        return `${daysUntil} day${daysUntil !== 1 ? "s" : ""} ${remainingHours}h`;
      }
      return `${daysUntil} day${daysUntil !== 1 ? "s" : ""}`;
    }
  };