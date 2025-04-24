export default function splitStringBefore(str, substring) {
  const index = str.indexOf(substring);

  if (index === -1) {
    return [str];
  }

  return str.substring(0, index);
  //return [str.substring(0, index), str.substring(index)];
}
