import * as R from 'ramda';
import { match } from './match';

// tslint:disable-next-line:no-unused-variable no-duplicate-imports
import { CurriedFunction2 } from 'ramda';

/**
 * (object: any, target: any) => boolean
 *
 * Returns `true` if `object` contains something matches `target` recursively, `false` otherwise.
 */
export const has = R.curry(internal_has)(R.__, R.__, []);

function internal_has(object: any, target: any, path: any[]): boolean {
  return R.cond([
    [/* is cyclic */ R.contains(R.__, path), R.F],
    [match(target), R.T],
    [R.isNil, R.F],
    [
      R.T,
      R.pipe(
        R.keys,
        R.any<string>(key =>
          internal_has(object[key], target, R.append(object, path)),
        ),
      ),
    ],
  ])(object);
}
