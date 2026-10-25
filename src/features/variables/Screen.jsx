import React from 'react';
import { VARIABLE_NAMES } from './data.js';

export default function VariablesScreen({ featureState, dispatch }) {
  const verb = featureState.mode === 'store' ? 'Store' : 'Recall';
  return <div className="variables-menu" aria-label={`${verb} variable`}>
    <div className="variables-prompt">{verb === 'Store' ? 'STO → select variable' : 'RCL: select variable'}</div>
    <div className="variables-choices">{VARIABLE_NAMES.map(name => <button type="button" key={name} aria-label={`${verb} ${name}`} title={`${name} = ${featureState.values[name].value}`} onClick={() => dispatch({ label: `${verb} ${name}`, action: 'variables.select', variable: name })}>{name}</button>)}</div>
  </div>;
}
