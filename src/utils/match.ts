import * as R from 'ramda';

// tslint:disable-next-line:no-unused-variable no-duplicate-imports
import { CurriedFunction2 } from 'ramda';

/**
 * (target: any, object: any) => boolean
 *
 * Returns `true` if `object` matches `target`, `false` otherwise.
 */
export const match = R.curry((target: any, object: any): boolean => {
  const keys = R.keys(target);
  return keys.length === 0
    ? R.equals(target, object)
    : R.all(R.__, keys)(
        R.tryCatch((key: string) => match(target[key], object[key]), R.F),
      );
});
