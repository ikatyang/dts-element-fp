export const selectable_default = false;
export const placeholder_default = false;

export const get_interface_name_default = (index: number) =>
  `CurriedFunction${index + 1}`;

export const get_interface_generic_name_default = (index: number) =>
  `T${index + 1}`;
export const get_interface_generic_return_name_default = () => 'R';

export const get_interface_parameter_name_default = (index: number) =>
  `v${index + 1}`;
export const get_interface_parameter_placeholder_name_default = (
  index: number,
) => `_${index + 1}`;

export const get_placeholder_type_default = () => 'PH';

export const get_function_parameter_placeholder_name_default = (name: string) =>
  `_${name}`;
export const get_function_selectable_selector_name_default = () => '$SEL';
export const get_function_selectable_kind_name_default = () => '$KIND';
export const get_function_type_name_default = (name: string, mask: string) =>
  `${name}_${mask}`;
