import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import * as math from '../services/math.js';
import { createRuntime } from './createRuntime.js';

const Screen = () => null;
const Text = () => null;

test('discovered feature folders compose in deterministic order with optional UI modules', () => {
  const modules = {
    '../features/zeta/index.js': { id: 'zeta', bindings: [{ key: 'hyp', value: '2' }] },
    '../features/alpha/index.js': { id: 'alpha', screen: true, bindings: [{ key: 'sin', value: '3' }] },
  };
  const runtime = createRuntime({
    math, featureModules: modules,
    screenModules: { '../features/alpha/Screen.jsx': Screen },
    textModules: { '../features/zeta/Text.jsx': Text },
  });
  assert.deepEqual(runtime.calculator.featureIds, ['alpha', 'zeta']);
  assert.equal(runtime.screens.alpha, Screen);
  assert.deepEqual(runtime.textRenderers, [Text]);
  let state = runtime.calculator.createInitialState();
  state = runtime.calculator.reducer(state, { label: 'hyp' });
  state = runtime.calculator.reducer(state, { label: '+', value: '+' });
  state = runtime.calculator.reducer(state, { label: 'sin' });
  state = runtime.calculator.reducer(state, { label: 'EXE', action: 'execute' });
  assert.equal(state.result, '5');
});

test('discovery catches mismatched folders, missing screens and orphan UI modules', () => {
  assert.throws(() => createRuntime({ math, featureModules: { '../features/wrong/index.js': { id: 'right' } } }), /must match/);
  assert.throws(() => createRuntime({ math, featureModules: { '../features/menu/index.js': { id: 'menu', screen: true } } }), /requires Screen/);
  assert.throws(() => createRuntime({ math, featureModules: {}, screenModules: { '../features/orphan/Screen.jsx': Screen } }), /no feature/);
});

test('all repository feature folders are discoverable without a shared registration list', async () => {
  const root = new URL('../features/', import.meta.url);
  const folders = (await readdir(root, { withFileTypes: true })).filter(entry => entry.isDirectory());
  const featureModules = {}, screenModules = {};
  for (const folder of folders) {
    if (!(await readdir(new URL(`${folder.name}/`, root))).includes('index.js')) continue;
    const { default: feature } = await import(new URL(`${folder.name}/index.js`, root));
    featureModules[`../features/${folder.name}/index.js`] = feature;
    if (feature.screen) screenModules[`../features/${folder.name}/Screen.jsx`] = Screen;
  }
  const runtime = createRuntime({ math, featureModules, screenModules });
  assert.equal(runtime.calculator.calculate('√(9)+2┘3'), 3.66666666667);
  assert.ok(runtime.calculator.featureIds.includes('constants'));
});
