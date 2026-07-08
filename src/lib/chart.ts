// Tree-shaken Chart.js. Importing from 'chart.js/auto' pulls in every controller,
// element, scale and plugin (~207 KB). Our two charts only need a line chart
// (ApoBExposure, with an area fill + legend) and a scatter chart (BloodPressure),
// both on linear axes with tooltips. Register exactly those pieces so the rest
// tree-shakes away.
//
// NOTE: registration is a runtime side effect — a successful build does NOT prove
// the set is complete. If a controller/element/scale is missing, `new Chart(...)`
// throws at runtime ("'line' is not a registered controller"). A missing *plugin*
// fails silently instead (e.g. without Colors, datasets that set no color render
// gray). Verify both charts render *with color* in a browser after changing this.
import {
  Chart,
  LineController,
  ScatterController,
  LineElement,
  PointElement,
  LinearScale,
  Colors,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  LineController, // ApoBExposure: type 'line'
  ScatterController, // BloodPressure: type 'scatter'
  LineElement, // line segments (and scatter's line parent)
  PointElement, // data points / hover targets
  LinearScale, // both charts use linear x and y axes
  Colors, // default palette for ApoBExposure's datasets (they set no color)
  Filler, // ApoBExposure dataset uses fill: true
  Tooltip, // both charts use custom tooltip callbacks
  Legend, // ApoBExposure shows the default legend
);

export { Chart };
