import * as dts from 'dts-element';
import * as R from 'ramda';

// tslint:disable-next-line:no-unused-variable no-duplicate-imports
import { IFunctionType } from 'dts-element';

export const has_same_parameter = (
  function_type_1: dts.IFunctionType,
  function_type_2: dts.IFunctionType,
  parameter_index: number,
) =>
  R.equals(
    function_type_1.parameters![parameter_index],
    function_type_2.parameters![parameter_index],
  );
