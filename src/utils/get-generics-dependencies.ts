import * as dts from 'dts-element';
import { has } from './has';

import { IGenericDeclaration } from 'dts-element';

export const get_generics_dependencies = (
  generics: dts.IGenericDeclaration[],
) =>
  generics.map(generic => [
    generic,
    ...generics.filter(current_generic =>
      has(generic, {
        kind: dts.ElementKind.GeneralType,
        name: current_generic.name,
      }),
    ),
  ]);
