import * as dts from 'dts-element';
import * as R from 'ramda';
import {
  get_interface_generic_name_default,
  get_interface_generic_return_name_default,
  get_interface_name_default,
  get_interface_parameter_name_default,
  get_interface_parameter_placeholder_name_default,
  get_placeholder_type_default,
  placeholder_default,
  selectable_default,
} from './utils/constants';
import {
  create_selectable_signatures,
  CreateSelectableSignaturesOptions,
} from './utils/create-selectable-signatures';
import { push_signatures } from './utils/push-signatures';
import { sort_signatures } from './utils/sort-signatures';

export interface CreateCurriedInterfacesOptions
  extends CreateSelectableSignaturesOptions {
  selectable?: boolean;
  placeholder?: boolean;
  get_placeholder_type?: () => string;
  get_interface_name?: (index: number) => string;
  get_generic_name?: (index: number) => string;
  get_generic_return_name?: () => string;
  get_parameter_name?: (index: number) => string;
  get_parameter_placeholder_name?: (index: number) => string;
}

export function create_curried_interfaces(
  max_curry_level: number,
  // istanbul ignore next
  options: CreateCurriedInterfacesOptions = {},
): dts.IInterfaceDeclaration[] {
  // istanbul ignore next
  const {
    selectable = selectable_default,
    placeholder = placeholder_default,
    get_placeholder_type = get_placeholder_type_default,
    get_interface_name = get_interface_name_default,
    get_generic_name = get_interface_generic_name_default,
    get_generic_return_name = get_interface_generic_return_name_default,
    get_parameter_name = get_interface_parameter_name_default,
    get_parameter_placeholder_name = get_interface_parameter_placeholder_name_default,
    get_selectable_kind_name,
    get_selectable_selector_name,
  } = options;

  const is_placeholder = (value: dts.IType) =>
    dts.is_general_type(value) && value.name === get_placeholder_type();

  const generics = R.range(0, max_curry_level).map((_, index) =>
    dts.create_generic_declaration({ name: get_generic_name(index) }),
  );

  const generic_return = dts.create_generic_declaration({
    name: get_generic_return_name(),
  });

  const parameters = generics.map((generic, index) =>
    dts.create_parameter_declaration({
      name: get_parameter_name(index),
      type: dts.create_general_type({ name: generic.name }),
    }),
  );

  const placeholders = parameters.map((_, index) =>
    dts.create_parameter_declaration({
      name: get_parameter_placeholder_name(index),
      type: dts.create_general_type({ name: get_placeholder_type() }),
    }),
  );

  const interfaces = generics.map((_, index) =>
    dts.create_interface_declaration({
      name: get_interface_name(index),
      generics: [...generics.slice(0, index + 1), generic_return],
      type: dts.create_object_type({ members: [] }),
    }),
  );

  interfaces.forEach((the_interface, index) => {
    push_signatures(
      is_placeholder,
      parameters.slice(0, index + 1),
      placeholder ? placeholders.slice(0, index + 1) : [],
      (used_parameters, return_parameters) => {
        the_interface.type!.members!.push(
          dts.create_object_member({
            owned: dts.create_function_declaration({
              name: undefined,
              type: dts.create_function_type({
                parameters: used_parameters,
                return:
                  return_parameters.length === 0
                    ? dts.create_general_type({ name: generic_return.name })
                    : dts.create_general_type({
                        name: interfaces[return_parameters.length - 1].name,
                        generics: [
                          ...return_parameters.map(
                            parameter => parameter.type!,
                          ),
                          dts.create_general_type({
                            name: generic_return.name,
                          }),
                        ],
                      }),
              }),
            }),
          }),
        );
      },
    );

    const object_type = interfaces[index].type!;
    object_type.members = sort_signatures(
      object_type.members as dts.IObjectMember[],
      { is_placeholder },
    );

    if (!selectable || object_type.members.length <= 1) {
      return;
    }

    object_type.members.splice(
      -1,
      0,
      ...create_selectable_signatures(
        object_type.members as dts.IObjectMember[],
        {
          get_selectable_kind_name,
          get_selectable_selector_name,
          is_placeholder,
        },
      ).reverse(),
    );
  });

  return interfaces;
}
