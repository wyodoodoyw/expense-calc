// import cutStringAfterExclusive from './cutStringAfterExclusive';
const parseAsLayover = (index, line) => {
  const newLayover = {
    index: index,
    isLayover: true,
  };

  if (line[0].includes('DPG')) {
    newLayover.hotelInfo = line.slice(1, line.length - 1).join(' ');
    newLayover.layoverMeals = line[line.length - 1];
  } else {
    newLayover.hotelInfo = line.slice(0, line.length - 1).join(' ');
    newLayover.layoverMeals = line[line.length - 1];
  }

  // if (line.match('TBA')) {

  return newLayover;
};

export default parseAsLayover;
