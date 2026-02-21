import { ResourceTimeline } from './components/ResourceTimeline';
import { demoStartDate, employeeProfiles, timelineWeeks, workPackages } from './data/mock-data';

function App() {
  return (
    <ResourceTimeline
      tasks={workPackages}
      employees={employeeProfiles}
      timelineStartDate={demoStartDate}
      timelineDays={timelineWeeks * 7}
    />
  );
}

export default App;
