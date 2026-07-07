// Tree-shaken Chart.js. Importing from 'chart.js/auto' pulls in every controller,
// element, scale and plugin (~207 KB). Our two charts only need a line chart
// (ApoBExposure, with an area fill + legend) and a scatter chart (BloodPressure),
// both on linear axes with tooltips. Register exactly those pieces so the rest
// tree-shakes away.
//
// NOTE: registration is a runtime side effect — a successful build does NOT prove
// the set is complete. If a piece is missing, `new Chart(...)` throws at runtime
// ("'line' is not a registered controller"). Verify both charts in a browser
// after changing this list.
import {
  Chart,
  LineController,
  ScatterController,
  LineElement,
  PointElement,
  LinearScale,
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
  Filler, // ApoBExposure dataset uses fill: true
  Tooltip, // both charts use custom tooltip callbacks
  Legend, // ApoBExposure shows the default legend
);

export { Chart };
