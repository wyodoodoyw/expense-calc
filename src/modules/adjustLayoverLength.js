const adjustLayoverLength = (layoverLength, diff) => {
  let hours = Number(layoverLength.slice(0, 2)) + diff.hours;
  let minutes = Number(layoverLength.slice(-2)) + diff.minutes;

  if (minutes >= 60) {
    hours += Math.floor(minutes / 60);
    minutes -= 60;
  }

  if (minutes < 0) {
    hours -= Math.floor(minutes / 60);
    minutes = 60 + minutes;
  }

  return `${hours}${minutes}`;
};

export default adjustLayoverLength;
