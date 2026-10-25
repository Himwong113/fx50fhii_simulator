import React from 'react';
import { useCalculator } from '../app/CalculatorContext.jsx';

export function DisplayText({ value }) {
  const { calculator, textRenderers } = useCalculator();
  function renderAt(index, text) {
    const Renderer = textRenderers[index];
    return Renderer ? <Renderer value={text} renderNext={nextText => renderAt(index + 1, nextText)} /> : text;
  }
  return renderAt(0, calculator.formatExpression(value));
}
export function ResultText({ value }) {
  const scientific = value.match(/^(-?\d+(?:\.\d+)?)e([+-]?\d+)$/i);
  if (!scientific) return <DisplayText value={value} />;
  return <span className="scientific-result"><span>{scientific[1]}</span><span className="scientific-scale">×10<sup>{Number(scientific[2]).toString().replace('-', '−')}</sup></span></span>;
}
