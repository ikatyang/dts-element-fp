import * as dts from 'dts-element';
import * as R from 'ramda';
import {
  get_function_parameter_placeholder_name_default,
  get_function_type_name_default,
  get_placeholder_type_default,
  inline_return_type_default,
  placeholder_default,
  selectable_default,
} from './utils/constants';
import { create_masks } from './utils/create-masks';
import {
  create_selectable_signatures,
  CreateSelectableSignaturesOptions,
} from './utils/create-selectable-signatures';
import { get_generics_dependencies } from './utils/get-generics-dependencies';
import { has } from './utils/has';
import { push_signatures } from './utils/push-signatures';

export interface CreateCurriedDeclarationsOptions
  extends CreateSelectableSignaturesOptions {
  selectable?: boolean;
  placeholder?: boolean;
  get_placeholder_type?: () => string;
  get_function_type_name?: (name: string, mask: string) => string;
  get_function_parameter_placeholder_name?: (name: string) => string;
  inline_return_type?: boolean;
}

/**
 * @hidden
 */
export function create_curried_types(
  name: string,
  type: dts.IFunctionType,
  // istanbul ignore next
  options: CreateCurriedDeclarationsOptions = {},
): dts.ITypeDeclaration[] {
  // istanbul ignore next
  const {
    selectable = selectable_default,
    placeholder = placeholder_default,
    get_placeholder_type = get_placeholder_type_default,
    get_function_type_name = get_function_type_name_default,
    get_function_parameter_placeholder_name = get_function_parameter_placeholder_name_default,
    get_selectable_kind_name,
    get_selectable_selector_name,
    inline_return_type = inline_return_type_default,
  } = options;

  const is_placeholder = (value: dts.IType) =>
    dts.is_general_type(value) && value.name === get_placeholder_type();

  const { generics = [], parameters = [], return: return_type } = type;

  const type_predicate_parameter = dts.is_type_predicate(return_type)
    ? parameters.find(
        parameter => parameter.name === (return_type.parameter as string),
      )!
    : null;

  const placeholders = parameters.map(parameter =>
    dts.create_parameter_declaration({
      name: get_function_parameter_placeholder_name(parameter.name),
      type: dts.create_general_type({ name: get_placeholder_type() }),
    }),
  );

  const generics_dependencies = get_generics_dependencies(generics);

  const sort_generics = (the_generics: dts.IGenericDeclaration[]) =>
    the_generics
      .slice()
      .sort((a, b) => generics.indexOf(a) - generics.indexOf(b));

  const add_generic_dependencies = (
    the_generics: dts.IGenericDeclaration[],
  ) => {
    const added: dts.IGenericDeclaration[] = [];

    the_generics.forEach(generic => {
      added.push(...generics_dependencies[generics.indexOf(generic)]);
    });

    return sort_generics(R.uniq(added));
  };

  const parameters_generics = parameters.map(parameter =>
    add_generic_dependencies(
      generics.filter(generic =>
        has(parameter, {
          kind: dts.ElementKind.GeneralType,
          name: generic.name,
        }),
      ),
    ),
  );

  const return_generics = add_generic_dependencies(
    generics.filter(generic =>
      has(return_type, {
        kind: dts.ElementKind.GeneralType,
        name: generic.name,
      }),
    ),
  );

  const target_types = R.repeat(0, 2 ** parameters.length).map(
    (_, index, array) =>
      index === array.length - 1
        ? dts.is_type_predicate(return_type) ? dts.boolean_type : return_type
        : dts.create_object_type({ members: [] }),
  );

  const masks = create_masks(parameters.length);
  const reverse_masks = masks.reduce<{ [mask: string]: number }>(
    (current_reverse_masks, mask, index) => ({
      ...current_reverse_masks,
      [mask]: index,
    }),
    {},
  );

  const type_declarations = target_types.map((target_type, index) => {
    const type_generics = sort_generics(
      index === target_types.length - 1
        ? return_generics
        : parameters_generics
            .filter((_, generics_index) => masks[index][generics_index] === '1')
            .reduce(
              (current_type_generics, filtered_parameter_generics) =>
                R.uniq(
                  current_type_generics.concat(filtered_parameter_generics),
                ),
              [],
            ),
    );
    return dts.create_type_declaration({
      name: get_function_type_name(name, masks[index]),
      generics: type_generics,
      type: target_type,
    });
  });

  type_declarations.slice(0, -1).forEach((type_declaration, index) => {
    const members = (type_declaration.type as dts.IObjectType)
      .members as dts.IObjectMember[];
    push_signatures(
      is_placeholder,
      parameters.filter((_, param_index) => masks[index][param_index] === '0'),
      placeholder
        ? placeholders.filter(
            (_, param_index) => masks[index][param_index] === '0',
          )
        : [],
      (used_parameters, return_parameters) => {
        const return_mask = parameters
          .map(
            parameter =>
              return_parameters.indexOf(parameter) === -1 ? '1' : '0',
          )
          .join('');
        const return_type_declaration =
          type_declarations[reverse_masks[return_mask]];
        const return_type_generics = return_type_declaration.generics!.map(
          generic => dts.create_general_type({ name: generic.name }),
        );
        const used_parameters_generics = sort_generics(
          R.uniq(
            used_parameters.reduce(
              (current, parameter) => [
                ...current,
                ...(parameter_index =>
                  parameter_index === -1
                    ? []
                    : parameters_generics[parameter_index])(
                  parameters.indexOf(parameter),
                ),
              ],
              return_type_declaration.generics!,
            ),
          ),
        ).filter(generic => type_declaration.generics!.indexOf(generic) === -1);
        members.push(
          dts.create_object_member({
            owned: dts.create_function_declaration({
              name: undefined,
              type: dts.create_function_type({
                generics: used_parameters_generics,
                parameters: used_parameters,
                return: get_overload_return_type(),
              }),
            }),
          }),
        );

        function get_overload_return_type() {
          if (return_mask.split('').every(R.equals('1'))) {
            if (type_predicate_parameter !== null) {
              if (used_parameters.indexOf(type_predicate_parameter) !== -1) {
                return return_type; // type_predicate: value is Type (matched parameter)
              }
              if (inline_return_type) {
                return dts.boolean_type; // type_predicate: boolean (unmatched parameter)
              }
            } else if (inline_return_type) {
              return return_type;
            }
          }
          return dts.create_general_type({
            name: return_type_declaration.name,
            generics: return_type_generics,
          });
        }
      },
    );

    if (!selectable || members.length <= 1) {
      return;
    }

    members.splice(
      -1,
      0,
      ...create_selectable_signatures(members, {
        is_placeholder,
        get_selectable_kind_name,
        get_selectable_selector_name,
      }),
    );
  });

  return type_declarations;
}
