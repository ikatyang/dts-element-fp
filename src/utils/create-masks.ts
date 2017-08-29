import * as R from 'ramda';
import { left_pad } from './left-pad';

/**
 * - `masks[0]` -> `"000"`
 * - `masks[1]` -> `"100"`
 * - `masks[2]` -> `"010"`
 * - ...
 */
export const create_masks = (length: number) =>
  R.repeat(0, 2 ** length).map((_, index) =>
    left_pad(index.toString(2), '0', length)
      .split('')
      .reverse()
      .join(''),
  );
