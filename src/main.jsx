import React from 'react';
import { createRoot } from 'react-dom/client';
import { runtime } from './app/runtime.js';
import { App } from './ui/App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<App runtime={runtime} />);
