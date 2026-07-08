import { describe, it, expect } from 'vitest';
import { Chart } from '../src/lib/chart';

// Guard for the tree-shaken Chart.js bundle (src/lib/chart.ts). Unlike a missing
// controller/element/scale — which throws "not a registered ..." at runtime — a
// missing *plugin* fails SILENTLY (e.g. dropping Colors makes charts render gray,
// which shipped once). Assert the registration list stays complete so that
// `npm run build` (which runs the tests first via the `prebuild` script) fails
// before a broken bundle can deploy.
//
// If you intentionally add/remove a chart feature, update this list to match
// src/lib/chart.ts.
describe('Chart.js registration (src/lib/chart.ts)', () => {
  const R = Chart.registry;
  const required: [string, string[], (id: string) => unknown][] = [
    ['controller', ['line', 'scatter'], (id) => R.getController(id)],
    ['element', ['line', 'point'], (id) => R.getElement(id)],
    ['scale', ['linear'], (id) => R.getScale(id)],
    ['plugin', ['colors', 'filler', 'tooltip', 'legend'], (id) => R.getPlugin(id)],
  ];

  it('registers every controller, element, scale and plugin the charts need', () => {
    const missing: string[] = [];
    for (const [kind, ids, get] of required) {
      for (const id of ids) {
        try {
          get(id);
        } catch {
          missing.push(`${kind}:${id}`);
        }
      }
    }
    expect(missing, 'unregistered Chart.js pieces — see src/lib/chart.ts').toEqual([]);
  });
});
