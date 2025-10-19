const calculateTimeDifference = (startTime, endTime) => {
  const startHours = Number(startTime.slice(0, 2));
  const startMinutes = Number(startTime.slice(-2));

  const endHours = Number(endTime.slice(0, 2));
  const endMinutes = Number(endTime.slice(-2));

  const hourDifference = startHours - endHours;
  const minuteDifference = startMinutes - endMinutes;

  return {
    hours: hourDifference,
    minutes: minuteDifference,
  };
};

export default calculateTimeDifference;
