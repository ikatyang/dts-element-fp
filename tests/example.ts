import * as dts from 'dts-element';
import * as dts_fp from '../src/index';

test('create_curried_interfaces', () => {
  const curried_interfaces = dts_fp.create_curried_interfaces(3);
  expect(dts.emit(curried_interfaces)).toMatchSnapshot();
});

test('create_curried_declarations (normal)', () => {
  const curried_declarations = dts_fp.create_curried_declarations(
    'append',
    dts.parse_type(
      '<T, U>(value: T, list: List<U>) => (T | U)[]',
    ) as dts.IFunctionType,
  );
  expect(dts.emit(curried_declarations)).toMatchSnapshot();
});

test('create_curried_declarations (various)', () => {
  const curried_declarations = dts_fp.create_curried_declarations('map', {
    list: dts.parse_type(
      '<T, U>(fn: (x: T) => U, list: List<T>) => U[]',
    ) as dts.IFunctionType,
    functor: dts.parse_type(
      '<T, U>(fn: (x: T) => U, functor: Functor<T>) => Functor<U>',
    ) as dts.IFunctionType,
  });
  expect(dts.emit(curried_declarations)).toMatchSnapshot();
});
