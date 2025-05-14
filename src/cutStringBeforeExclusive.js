export default function cutStringBeforeExclusive(str, substring) {
  const index = str.indexOf(substring);

  if (index === -1) {
    return [str];
  }

  return str.substring(0, index);
  //return [str.substring(0, index), str.substring(index)];
}

// splitStringAfter('T5021 OPERATES/OPER- 10OCT - 22OCT', 'OPERATES');
// => T5021
// cuts string before occurance of substring, excludes substring
