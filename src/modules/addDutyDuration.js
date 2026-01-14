const addDutyDuration = (duration1, duration2) => {
  // console.log(`duration1: ${duration1}`);
  // console.log(`duration2: ${duration2}`);
  const hours1 = Number(duration1.slice(0, -2)) || 0;
  const hours2 = Number(duration2.slice(0, -2)) || 0;
  const minutes1 = Number(duration1.slice(-2)) || 0;
  const minutes2 = Number(duration2.slice(-2) || 0);

  let durationHours = hours1 + hours2;
  let durationMinutes = minutes1 + minutes2;

  if (durationMinutes >= 60) {
    durationHours += Math.floor(durationMinutes / 60);
    durationMinutes = durationMinutes % 60;
  }

  if (durationHours > 0) {
    // console.log(
    //   `${durationHours.toString()}${durationMinutes.toLocaleString('en-US', {
    //     minimumIntegerDigits: 2,
    //     useGrouping: false,
    //   })}`
    // );
    return `${durationHours.toString()}${durationMinutes.toLocaleString(
      'en-US',
      {
        minimumIntegerDigits: 2,
        useGrouping: false,
      }
    )}`;
  } else {
    // console.log(
    //   `${durationMinutes.toLocaleString('en-US', {
    //     minimumIntegerDigits: 2,
    //     useGrouping: false,
    //   })}`
    // );
    return `${durationMinutes.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })}`;
  }
};

export default addDutyDuration;
