const calcLayoverDays = (start, end, length) => {
  const startHours = Number(start.slice(0, 2));
  const startMinutes = Number(start.slice(-2)) + 15;

  const endHours = Number(end.slice(0, 2)) - 1;
  const endMinutes = Number(end.slice(-2));

  const lengthHours = Number(length.slice(0, 2));
  const lengthMinutes = Number(length.slice(-2));

  let numberDays = lengthHours + startHours - endHours - 24;
  numberDays += Math.floor((lengthMinutes + startMinutes - endMinutes) / 60);
  numberDays = Math.floor(numberDays / 24);
  return numberDays;
};

export default calcLayoverDays;
