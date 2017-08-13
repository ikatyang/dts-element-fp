import * as dts from 'dts-element';
import { create_various_curried_types } from './create-curried-various-types';
import { parse_types } from './utils/parse-types';

const test_cases: Record<string, string> = {
  'non-generics': `
    function number(a: number, b: number): boolean;
    function string(a: string, b: string): boolean;
  `,
  'generics + multi-parameters': `
    function string(str: string): string;
    function list<T>(list: List<T>): T | undefined;
  `,
  'generics + multi-parameters + return-generics': `
    function list<T, U>(fn: Morphism<T, U>, list: List<T>): U[];
    function functor<T, U>(fn: Morphism<T, U>, functor: Functor<T>): Functor<U>;
  `,
};

it('should throw error if those function types have different length', () => {
  expect(() =>
    create_various_curried_types(
      '$',
      parse_types(`
    function $1(a: any): any;
    function $2(a: any, b: any): any;
  `),
    ),
  ).toThrowError();
});

describe('merge-non-conflicts', () => {
  it('should return correctly with mergable types', () => {
    expect(
      dts.emit(
        create_various_curried_types(
          '$',
          parse_types(`
            function list<T, U extends List<T>>(fn: (x: T) => T, container: U): U;
            function object<T, U extends Dictionary<T>>(fn: (x: T) => T, container: U): U;
          `),
        ),
      ),
    ).toMatchSnapshot();
  });
  it('should return correctly with un-mergable types', () => {
    expect(
      dts.emit(
        create_various_curried_types(
          '$',
          parse_types(`
            function list<T, U extends List<T>>(fn: (x: T) => T, container: U): U;
            function object<X, Y extends Dictionary<X>>(fn: (x: X) => X, container: Y): Y;
          `),
        ),
      ),
    ).toMatchSnapshot();
  });
});

Object.keys(test_cases).forEach(case_name => {
  describe(case_name, () => {
    it('should transform correctly without any options', () => {
      expect(emit_curried_types()).toMatchSnapshot();
    });

    it('should transform correctly with selectable', () => {
      expect(
        emit_curried_types({
          selectable: true,
        }),
      ).toMatchSnapshot();
    });

    it('should transform correctly with placeholder', () => {
      expect(
        emit_curried_types({
          placeholder: true,
        }),
      ).toMatchSnapshot();
    });

    it('should transform correctly with every option', () => {
      expect(
        emit_curried_types({
          selectable: true,
          placeholder: true,
        }),
      ).toMatchSnapshot();
    });
  });

  function emit_curried_types(
    options: { selectable?: boolean; placeholder?: boolean } = {},
  ) {
    const test_case = test_cases[case_name];
    const function_types = parse_types(test_case);

    const curried_types = create_various_curried_types(
      '$',
      function_types,
      options,
    );
    const top_level_element = dts.create_top_level_element({
      members: curried_types,
    });
    return dts.emit(top_level_element);
  }
});
