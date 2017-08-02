import * as dts from 'dts-element';
import * as R from 'ramda';

export function push_signatures(
  is_placeholder: (value: dts.IType) => boolean,
  rest_parameters: dts.IParameterDeclaration[],
  rest_placeholders: dts.IParameterDeclaration[],
  callback: (
    used_parameters: dts.IParameterDeclaration[],
    return_parameters: dts.IParameterDeclaration[],
  ) => void,
  // for internal recursive
  used_parameters: dts.IParameterDeclaration[] = [],
  return_parameters: dts.IParameterDeclaration[] = rest_parameters,
): void {
  if (rest_parameters.length > 0) {
    const next_rest_parameters = rest_parameters.slice(1);
    const next_rest_placeholders = rest_placeholders.slice(1);
    push_signatures(
      is_placeholder,
      next_rest_parameters,
      next_rest_placeholders,
      callback,
      R.append(R.head(rest_parameters)!, used_parameters),
      return_parameters.filter(R.complement(R.equals(R.head(rest_parameters)))),
    );
    if (rest_placeholders.length > 0) {
      push_signatures(
        is_placeholder,
        next_rest_parameters,
        next_rest_placeholders,
        callback,
        R.append(R.head(rest_placeholders)!, used_parameters),
        return_parameters,
      );
    }
  }
  if (
    used_parameters.length > 0 &&
    !is_placeholder(R.last(used_parameters)!.type!)
  ) {
    callback(used_parameters, return_parameters);
  }
}
