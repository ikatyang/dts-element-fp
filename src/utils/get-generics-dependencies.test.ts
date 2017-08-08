import * as dts from 'dts-element';
import { get_generics_dependencies } from './get-generics-dependencies';

test_case(test, '<A, B extends A, C extends A, D, E>');
test_case(test, '<A, B extends A, C extends B, D, E>');

function test_case(tester: typeof test, generics: string) {
  tester(generics, () => {
    expect(
      emit_generics_dependencies(parse_generices(generics)),
    ).toMatchSnapshot();
  });
}

function parse_generices(str: string) {
  const type = dts.parse_type(`${str}() => any`);
  return (type as dts.IFunctionType).generics!;
}

function emit_generics_dependencies(generics: dts.IGenericDeclaration[]) {
  const generics_dependencies = get_generics_dependencies(generics);
  return generics.reduce(
    (current, generic, index) => ({
      ...current,
      [generic.name]: generics_dependencies[index].map(x => x.name),
    }),
    {},
  );
}
