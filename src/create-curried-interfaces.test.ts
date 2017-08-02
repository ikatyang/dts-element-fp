import * as dts from 'dts-element';
import { create_curried_interfaces } from './create-curried-interfaces';

it('should generate correctly without any options', () => {
  expect(emit_curried_interfaces()).toMatchSnapshot();
});

it('should generate correctly with selectable', () => {
  expect(
    emit_curried_interfaces({
      selectable: true,
    }),
  ).toMatchSnapshot();
});

it('should generate correctly with placeholder', () => {
  expect(
    emit_curried_interfaces({
      placeholder: true,
    }),
  ).toMatchSnapshot();
});

it('should generate correctly with every option', () => {
  expect(
    emit_curried_interfaces({
      selectable: true,
      placeholder: true,
    }),
  ).toMatchSnapshot();
});

function emit_curried_interfaces(
  options: { selectable?: boolean; placeholder?: boolean } = {},
) {
  const curried_interfaces = create_curried_interfaces(3, options);
  const top_level_element = dts.create_top_level_element({
    members: curried_interfaces,
  });
  return dts.emit(top_level_element);
}
