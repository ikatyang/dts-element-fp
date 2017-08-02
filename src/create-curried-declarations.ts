import * as dts from 'dts-element';
import {
  create_curried_types,
  CreateCurriedDeclarationsOptions,
} from './create-curried-types';
import { create_various_curried_types } from './create-curried-various-types';
import { get_placeholder_type_default } from './utils/constants';
import { sort_signatures } from './utils/sort-signatures';

export function create_curried_declarations(
  name: string,
  type: dts.IFunctionType | Record<string, dts.IFunctionType>,
  // istanbul ignore next
  options: CreateCurriedDeclarationsOptions = {},
): (dts.IVariableDeclaration | dts.ITypeDeclaration)[] {
  const type_declarations = dts.is_function_type(type)
    ? create_curried_types(name, type, options)
    : ((keys: string[]) =>
        keys.length === 1
          ? create_curried_types(name, type[keys[0]], options)
          : create_various_curried_types(name, type, options))(
        Object.keys(type),
      );

  // istanbul ignore next
  const { get_placeholder_type = get_placeholder_type_default } = options;

  const is_placeholder = (value: dts.IType) =>
    dts.is_general_type(value) && value.name === get_placeholder_type();

  const sorted_type_declarations = type_declarations.map(type_declaration => {
    const type_declaration_type = type_declaration.type;

    if (!dts.is_object_type(type_declaration_type)) {
      return type_declaration;
    }

    return {
      ...type_declaration,
      type: {
        ...type_declaration_type,
        members: sort_signatures(
          type_declaration_type.members as dts.IObjectMember[],
          { is_placeholder },
        ),
      },
    };
  });

  return [
    dts.create_variable_declaration({
      name,
      const: true,
      type: dts.create_general_type({
        name: sorted_type_declarations[0].name,
      }),
    }),
    ...sorted_type_declarations,
  ];
}
