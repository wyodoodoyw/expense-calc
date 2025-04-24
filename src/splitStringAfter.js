export default function splitStringBefore(str, substring) {
  const index = str.indexOf(substring);

  if (index === -1) {
    return [str];
  }

  return str.substring(index);
}
