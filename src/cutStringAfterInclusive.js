export default function cutStringAfterInclusive(str, substring) {
  const index = str.indexOf(substring);

  if (index === -1) {
    return [str];
  }

  return str.substring(index);
}

// splitStringAfter('T5021 OPERATES/OPER- 10OCT - 22OCT', 'OPERATES');
// => OPERATES/OPER- 10OCT - 22OCT
// cuts string after occurance of substring, includes substring
