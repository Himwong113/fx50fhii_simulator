import { createCalculator } from '../core/createCalculator.js';

/** Compose discovery results without coupling the factory to Vite or React. */
export function createRuntime({ math, featureModules, screenModules = {}, textModules = {} }) {
  const features = Object.entries(featureModules).sort(([a], [b]) => a.localeCompare(b)).map(([path, feature]) => {
    const folder = path.split('/').at(-2);
    if (folder !== feature.id) throw new Error(`Feature folder ${folder} must match id ${feature.id}`);
    return feature;
  });
  const screens = Object.assign(Object.create(null), Object.fromEntries(Object.entries(screenModules).map(([path, Screen]) => [path.split('/').at(-2), Screen])));
  const textById = Object.assign(Object.create(null), Object.fromEntries(Object.entries(textModules).map(([path, Text]) => [path.split('/').at(-2), Text])));
  const calculator = createCalculator({ math, features });
  for (const id of [...Object.keys(screens), ...Object.keys(textById)]) {
    if (!calculator.featureIds.includes(id)) throw new Error(`UI module has no feature: ${id}`);
  }
  for (const feature of features) {
    if (feature.screen && !screens[feature.id]) throw new Error(`Feature ${feature.id} requires Screen.jsx`);
  }
  const textRenderers = calculator.featureIds.map(id => textById[id]).filter(Boolean);
  return Object.freeze({ calculator, screens: Object.freeze(screens), textRenderers: Object.freeze(textRenderers) });
}
