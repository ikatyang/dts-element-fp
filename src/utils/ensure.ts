export function ensure<T>(value: any, is: (x: any) => x is T): T {
  const is_something = is(value);
  // istanbul ignore next
  if (!is_something) {
    throw new Error('Invalid value');
  }
  return value;
}
