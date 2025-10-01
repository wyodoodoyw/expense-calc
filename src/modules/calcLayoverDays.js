const calcLayoverDays = (start, end, length) => {
  // console.log(`start: ${start}, end: ${end}, length: ${length}`);
  const startHours = Number(start.slice(0, 2));
  // console.log(`startHours: ${startHours}`);
  const startMinutes = Number(start.slice(-2)) + 15;

  const endHours = Number(end.slice(0, 2)) - 1;
  // console.log(`endHours: ${endHours}`);
  const endMinutes = Number(end.slice(-2));

  const lengthHours = Number(length.slice(0, 2));
  // console.log(`lHours: ${lengthHours}`);
  const lengthMinutes = Number(length.slice(-2));

  let numberDays = lengthHours + startHours - endHours - 24;
  // console.log(`numberDays (hours): ${numberDays}`);
  // console.log(
  //   `minutes: ${Math.floor((lengthMinutes + startMinutes - endMinutes) / 60)}`
  // );
  numberDays += Math.floor((lengthMinutes + startMinutes - endMinutes) / 60);
  // console.log(`numberDays (hours + minutes): ${numberDays}`);
  numberDays = Math.floor(numberDays / 24);
  // console.log(`numberDays (minutes): ${numberDays}`);
  return numberDays;
};

export default calcLayoverDays;
