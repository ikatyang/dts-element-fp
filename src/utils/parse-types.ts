import * as dts from 'dts-element';

export function parse_types(
  types_string: string,
): Record<string, dts.IFunctionType> {
  const function_declarations = dts.parse(types_string)
    .members as dts.IFunctionDeclaration[];
  return function_declarations.reduce<Record<string, dts.IFunctionType>>(
    (current, function_declaration) => ({
      ...current,
      [function_declaration.name!]: function_declaration.type!,
    }),
    {},
  );
}
