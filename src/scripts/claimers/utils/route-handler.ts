import {
  layerZero,
  polyhedra,
  taiko,
  scroll,
  superform,
  elixir,
  symbiotic,
  swell,
  odos,
} from '../../../_inputs/settings/routes';
import { Route } from '../../../types';

export const routeHandler = (route: Route) => {
  switch (route) {
    case 'polyhedra':
      return polyhedra;
    case 'layer-zero':
      return layerZero;
    case 'taiko':
      return taiko;
    case 'scroll':
      return scroll;
    case 'superform':
      return superform;
    case 'elixir':
      return elixir;
    case 'symbiotic':
      return symbiotic;
    case 'swell':
      return swell;
    case 'odos':
      return odos;

    default:
      throw new Error('Route name is wrong');
  }
};
