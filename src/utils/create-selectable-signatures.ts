import * as dts from 'dts-element';
import {
  get_function_selectable_kind_name_default,
  get_function_selectable_selector_name_default,
} from './constants';

export interface CreateSelectableSignaturesOptions {
  get_selectable_kind_name?: () => string;
  get_selectable_selector_name?: () => string;
}

export interface CreateSelectableSignaturesInternalOptions
  extends CreateSelectableSignaturesOptions {
  /**
   * - normal: `undefined`
   * - various: `string`
   */
  group?: string;
  is_placeholder: (value: dts.IType) => boolean;
}

export function create_selectable_signatures(
  signatures: dts.IObjectMember[],
  options: CreateSelectableSignaturesInternalOptions,
): dts.IObjectMember[] {
  // istanbul ignore next
  const {
    group,
    is_placeholder,
    get_selectable_kind_name = get_function_selectable_kind_name_default,
    get_selectable_selector_name = get_function_selectable_selector_name_default,
  } = options;

  return signatures.map(signature => {
    const function_type = (signature.owned as dts.IFunctionDeclaration).type!;

    // istanbul ignore next
    const { parameters = [] } = function_type;

    const selectable_type = parameters
      .map(parameter => (is_placeholder(parameter.type!) ? '0' : '1'))
      .join('');

    return dts.create_object_member({
      owned: dts.create_function_declaration({
        name: undefined,
        type: dts.create_function_type({
          parameters: [],
          generics: [
            dts.create_generic_declaration({
              name: get_selectable_selector_name(),
              extends: dts.create_literal_type({ value: selectable_type }),
            }),
            ...(group === undefined
              ? []
              : [
                  dts.create_generic_declaration({
                    name: get_selectable_kind_name(),
                    extends: dts.create_literal_type({ value: group }),
                  }),
                ]),
          ],
          return: function_type,
        }),
      }),
    });
  });
}
