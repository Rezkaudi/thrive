  export const getTimeUntilSession = (sessionDate: string) => {
    const sessionTime = new Date(sessionDate);
    const now = new Date();
    const hoursUntil =
      (sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil;
  };

  export const isWithin24Hours = (sessionDate: string) => {
    const hoursUntil = getTimeUntilSession(sessionDate);
    return hoursUntil <= 24 && hoursUntil > 0;
  };

  export const formatTimeUntilSession = (sessionDate: string) => {
    const hoursUntil = getTimeUntilSession(sessionDate);

    if (hoursUntil < 0) {
      return "Session has passed";
    } else if (hoursUntil < 1) {
      const minutesUntil = Math.floor(hoursUntil * 60);
      return `${minutesUntil} minutes`;
    } else if (hoursUntil < 24) {
      return `${Math.floor(hoursUntil)} hours`;
    } else {
      const daysUntil = Math.floor(hoursUntil / 24);
      return `${daysUntil} day${daysUntil !== 1 ? "s" : ""}`;
    }
  };