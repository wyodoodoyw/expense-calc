export default function cutStringAfterExclusive(str, substring) {
  const index = str.indexOf(substring) + substring.length;

  if (index === -1) {
    return [str];
  }

  return str.substring(index);
}

// splitStringAfter('T5021 OPERATES/OPER- 10OCT - 22OCT', 'OPERATES');
// => /OPER- 10OCT - 22OCT
// cuts string after occurance of substring, excludes substring
