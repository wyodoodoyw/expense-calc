const calcLayoverDays = (start, end, length) => {
  const startHours = Number(start.slice(0, 2));
  const startMinutes = Number(start.slice(-2)) + 15;

  const endHours = Number(end.slice(0, 2)) - 1;
  const endMinutes = Number(end.slice(-2));

  const lengthHours = Number(length.slice(0, 2));
  const lengthMinutes = Number(length.slice(-2));

  let numberDays = lengthHours + startHours - endHours;
  numberDays += Math.floor((lengthMinutes + startMinutes - endMinutes) / 60);
  numberDays = Math.floor(numberDays / 24);
  console.log(`No. Hours: ${numberDays}`);
  return numberDays;
};

export default calcLayoverDays;
