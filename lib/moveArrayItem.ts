/** Перемістити елемент на одну позицію вгору (-1) або вниз (+1). */
export function moveArrayItem<T>(arr: T[], index: number, direction: -1 | 1): T[] {
  const next = index + direction;
  if (next < 0 || next >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return copy;
}
