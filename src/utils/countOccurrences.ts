export function countOccurrences(subString: string, text: string) {
  return text.split(subString).length - 1;
}
