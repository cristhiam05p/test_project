import { ResourceTimeline } from './components/ResourceTimeline';
import { demoStartDate, workPackages } from './data/mock-data';

function App() {
  return <ResourceTimeline tasks={workPackages} timelineStartDate={demoStartDate} />;
}

export default App;
