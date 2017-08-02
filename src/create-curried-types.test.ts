import * as dts from 'dts-element';
import { create_curried_types } from './create-curried-types';

const test_cases: Record<string, string> = {
  'non-generics': `
    function clamp(min: number, max: number, value: number): number;
  `,
  'generics + multi-parameters': `
    function all<T>(fn: Predicate<T>, list: List<T>): boolean;
  `,
  'generics + multi-parameters + return-generics': `
    function adjust<T, U>(fn: Morphism<T, U>, index: number, list: List<T>): (T | U)[];
  `,
  'type-predicate': `
    function is<T>(constructor: Constructor<T>, value: any): value is T;
  `,
};

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
    const function_declaration = dts.parse(test_case)
      .members[0] as dts.IFunctionDeclaration;

    const curried_types = create_curried_types(
      function_declaration.name!,
      function_declaration.type!,
      options,
    );
    const top_level_element = dts.create_top_level_element({
      members: curried_types,
    });
    return dts.emit(top_level_element);
  }
});
