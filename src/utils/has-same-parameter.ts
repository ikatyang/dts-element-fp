import * as dts from 'dts-element';
import * as R from 'ramda';
import { get_generics_dependencies } from './get-generics-dependencies';
import { has } from './has';

// tslint:disable-next-line:no-unused-variable no-duplicate-imports
import { IFunctionType } from 'dts-element';

export const has_same_parameter = (
  function_type_1: dts.IFunctionType,
  function_type_2: dts.IFunctionType,
  parameter_index: number,
) => {
  const [first, second] = [function_type_1, function_type_2].map(
    function_type => {
      const { parameters = [], generics = [] } = function_type;
      const parameter_type = parameters[parameter_index].type!;
      return { generics, parameter_type };
    },
  );

  if (!R.equals(first.parameter_type, second.parameter_type)) {
    // suppose type that looks different should have different meaning
    return false;
  }

  // check if the same generic name has the same meaning

  const [generic_tree_1, generic_tree_2] = [first, second].map(data => {
    const { generics, parameter_type } = data;
    const parameter_generics_and_indexes = generics
      .map((generic, index) => ({ generic, index }))
      .filter(({ generic }) =>
        has(parameter_type, {
          kind: dts.ElementKind.GeneralType,
          name: generic.name,
        }),
      );
    const generics_dependencies = get_generics_dependencies(generics);
    return parameter_generics_and_indexes.reduce<
      Record<string, dts.IGenericDeclaration[]>
    >(
      (current, { generic, index }) => ({
        ...current,
        [generic.name]: generics_dependencies[index]
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name)),
      }),
      {},
    );
  });

  return R.equals(generic_tree_1, generic_tree_2);
};
