export default function cutStringBetween(str, substring1, substring2) {
  const index1 = str.indexOf(substring1);
  const index2 = str.indexOf(substring2);

  if (index === -1) {
    return [str];
  }

  return str.substring(0, index);
  //return [str.substring(0, index), str.substring(index)];
}

// splitStringAfter('T5021 OPERATES/OPER- 10OCT - 22OCT', 'OPERATES');
// => T5021
// cuts string at before occurance of substring, excludes substring
