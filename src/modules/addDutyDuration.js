const addDutyDuration = (duration1, duration2) => {
  let hours1 = '0';
  let hours2 = '0';
  const minutes1 = Number(duration1.slice(-2));
  const minutes2 = Number(duration2.slice(-2));

  switch (duration1.length) {
    case 3:
      hours1 = Number(duration1.slice(0, 1));
      break;
    case 4:
      hours1 = Number(duration1.slice(0, 2));
      break;
    default:
      break;
  }

  switch (duration2.length) {
    case 3:
      hours2 = Number(duration2.slice(0, 1));
      break;
    case 4:
      hours2 = Number(duration2.slice(0, 2));
      break;
    default:
      break;
  }

  let durationHours = hours1 + hours2;
  let durationMinutes = minutes1 + minutes2;

  if (durationMinutes >= 60) {
    durationHours += Math.floor(durationMinutes / 60);
    durationMinutes = durationMinutes % 60;
  }

  return `${durationHours.toString()}${durationMinutes.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })}`;
};

export default addDutyDuration;
