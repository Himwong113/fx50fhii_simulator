import React from 'react';

export default function FractionText({ value, renderNext }) {
  return value.split('┘').map((part, index) => <React.Fragment key={index}>
    {index > 0 && <span className="fraction-separator"><span className="sr-only">┘</span></span>}{renderNext(part)}
  </React.Fragment>);
}
