# dts-element-fp

[![npm](https://img.shields.io/npm/v/dts-element-fp.svg)](https://www.npmjs.com/package/dts-element-fp)
[![build](https://img.shields.io/travis/ikatyang/dts-element-fp/master.svg)](https://travis-ci.org/ikatyang/dts-element-fp/builds)
[![coverage](https://img.shields.io/codecov/c/github/ikatyang/dts-element-fp/master.svg)](https://codecov.io/gh/ikatyang/dts-element-fp)

typescript definition generator for functional programming

[Changelog](https://github.com/ikatyang/dts-element-fp/blob/master/CHANGELOG.md) - [Examples](https://github.com/ikatyang/dts-element-fp/tree/master/tests/) - [Documentation](https://ikatyang.github.io/dts-element-fp/)

## Install

```sh
# using npm
npm install --save-dev dts-element-fp dts-element

# using yarn
yarn add --dev dts-element-fp dts-element
```

## Usage

```ts
import * as dts from 'dts-element';
import * as dts_fp from 'dts-element-fp';

const curried_interfaces = dts_fp.create_curried_interfaces(3);

dts.emit(curried_interfaces); /*=>
  interface CurriedFunction1<T1, R> {
      (v1: T1): R;
  }
  interface CurriedFunction2<T1, T2, R> {
      (v1: T1): CurriedFunction1<T2, R>;
      (v1: T1, v2: T2): R;
  }
  interface CurriedFunction3<T1, T2, T3, R> {
      (v1: T1): CurriedFunction2<T2, T3, R>;
      (v1: T1, v2: T2): CurriedFunction1<T3, R>;
      (v1: T1, v2: T2, v3: T3): R;
  }
*/

const curried_declarations_normal = dts_fp.create_curried_declarations(
  'append',
  dts.parse_type('<T, U>(value: T, list: List<U>) => (T | U)[]'),
);

dts.emit(curried_declarations_normal); /*=>
  declare const append: append_00;
  type append_00 = {
      <T>(value: T): append_10<T>;
      <T, U>(value: T, list: List<U>): append_11<T, U>;
  };
  type append_10<T> = {
      <U>(list: List<U>): append_11<T, U>;
  };
  type append_11<T, U> = (T | U)[];
*/

const curried_declarations_various = dts_fp.create_curried_declarations(
  'map',
  {
    list: dts.parse_type('<T, U>(fn: (x: T) => U, list: List<T>) => U[]'),
    functor: dts.parse_type('<T, U>(fn: (x: T) => U, functor: Functor<T>) => Functor<U>'),
  },
);

dts.emit(curried_declarations_various); /*=>
  declare const map: map_00;
  type map_00 = {
      <T, U>(fn: (x: T) => U): map_10<T, U>;
      <T, U>(fn: (x: T) => U, list: List<T>): map_list_11<U>;
      <T, U>(fn: (x: T) => U, functor: Functor<T>): map_functor_11<U>;
  };
  type map_10<T, U> = {
      (list: List<T>): map_list_11<U>;
      (functor: Functor<T>): map_functor_11<U>;
  };
  type map_list_11<U> = U[];
  type map_functor_11<U> = Functor<U>;
*/
```

See [Documentation](https://ikatyang.github.io/dts-element-fp/) for more options.

## Development

```sh
# lint
yarn run lint

# build
yarn run build

# test
yarn run test
```

## Related

- [dts-element](https://github.com/ikatyang/dts-element) - A DOM library for generation TypeScript declaration (.d.ts) files

## License

MIT © [Ika](https://github.com/ikatyang)
