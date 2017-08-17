import * as dts from 'dts-element';
import { create_curried_declarations } from './create-curried-declarations';
import { CreateCurriedDeclarationsOptions } from './create-curried-types';
import { parse_types } from './utils/parse-types';

const test_cases = {
  normal: `
    function adjust<T, U>(fn: Morphism<T, U>, index: number, list: List<T>): (T | U)[];
  `,
  various: `
    function list<T, U>(fn: Morphism<T, U>, list: List<T>): U[];
    function functor<T, U>(fn: Morphism<T, U>, functor: Functor<T>): Functor<U>;
  `,
};

it('should transform correctly with type = FunctionType', () => {
  expect(
    emit_curried_declarations(test_cases.normal, { use_first_type: true }),
  ).toMatchSnapshot();
});

it('should transform correctly with type = Record<string, FunctionType> (= 1 key)', () => {
  expect(emit_curried_declarations(test_cases.normal)).toMatchSnapshot();
});

it('should transform correctly with type = Record<string, FunctionType> (> 1 key)', () => {
  expect(emit_curried_declarations(test_cases.various)).toMatchSnapshot();
});

it('should omit unnecessary types with placeholder = false and type = FunctionType', () => {
  expect(
    emit_curried_declarations(test_cases.normal, { placeholder: false }),
  ).toMatchSnapshot();
});

it('should omit unnecessary types with placeholder = false and type = Record<string, FunctionType>', () => {
  expect(
    emit_curried_declarations(test_cases.various, { placeholder: false }),
  ).toMatchSnapshot();
});

function emit_curried_declarations(
  test_case: string,
  raw_options: CreateCurriedDeclarationsOptions & {
    use_first_type?: boolean;
  } = {},
) {
  const types = parse_types(test_case);

  const { use_first_type = false } = raw_options;

  const options = {
    selectable: true,
    placeholder: true,
    ...raw_options,
  };

  const curried_types = use_first_type
    ? create_curried_declarations('$', types[Object.keys(types)[0]], options)
    : create_curried_declarations('$', types, options);

  const top_level_element = dts.create_top_level_element({
    members: curried_types,
  });
  return dts.emit(top_level_element);
}
