export function deepCopy(obj) {
  const json = JSON.stringify(obj);
  const output = JSON.parse(obj);
  return output;
}