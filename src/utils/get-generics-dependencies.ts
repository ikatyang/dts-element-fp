import * as dts from 'dts-element';
import * as R from 'ramda';
import { has } from './has';

// tslint:disable-next-line:no-unused-variable no-duplicate-imports
import { IGenericDeclaration } from 'dts-element';

export const get_generics_dependencies = (
  generics: dts.IGenericDeclaration[],
) => {
  const generics_dependencies: any[] = generics.map(x => [x]);

  generics.forEach((generic, index) => {
    generics.forEach((current_generic, current_index) => {
      if (
        generic === current_generic ||
        !has(generic, {
          kind: dts.ElementKind.GeneralType,
          name: current_generic.name,
        })
      ) {
        return;
      }

      generics_dependencies[index].push(
        current_generic,
        generics_dependencies[current_index],
      );
    });
  });

  return generics_dependencies.map(
    R.pipe(R.flatten, R.uniq),
  ) as dts.IGenericDeclaration[][];
};
