const taskStatuses = ['PLANNED', 'IN_PROGRESS', 'DONE', 'BLOCKED'];
const timeOffTypes = ['VACATION', 'SICK', 'OTHER'];

function createSeed() {
  const departments = [
    { id: 'dep_eng', name: 'Engineering', isActive: true },
    { id: 'dep_des', name: 'Design', isActive: true },
  ];

  const employees = [
    { id: 'emp_alice', fullName: 'Alice Rivera', departmentId: 'dep_eng', capacityHoursPerWeek: 40, costPerHour: 65, isActive: true },
    { id: 'emp_bob', fullName: 'Bob Martín', departmentId: 'dep_eng', capacityHoursPerWeek: 35, costPerHour: null, isActive: true },
    { id: 'emp_carla', fullName: 'Carla Soto', departmentId: 'dep_des', capacityHoursPerWeek: 40, costPerHour: null, isActive: true },
  ];

  const projects = [{ id: 'pro_web', name: 'Website Revamp', color: '#3B82F6', isActive: true }];

  const tasks = [{
    id: 'tsk_onboarding',
    title: 'Implement onboarding flow',
    description: 'Crear onboarding inicial para usuarios nuevos.',
    projectId: 'pro_web',
    departmentId: 'dep_eng',
    startDate: '2026-02-16',
    endDate: '2026-02-27',
    estimatedHours: 80,
    status: 'IN_PROGRESS',
    priority: 2,
    isActive: true,
  }];

  const taskAssignments = [
    { id: 'asg_alice_onboarding', taskId: 'tsk_onboarding', employeeId: 'emp_alice', allocationHours: 30 },
    { id: 'asg_bob_onboarding', taskId: 'tsk_onboarding', employeeId: 'emp_bob', allocationHours: 20 },
  ];

  const timeOff = [{
    id: 'to_carla_1',
    employeeId: 'emp_carla',
    startDate: '2026-02-24',
    endDate: '2026-02-26',
    type: 'VACATION',
    notes: 'Vacaciones planificadas',
  }];

  return { departments, employees, projects, tasks, taskAssignments, timeOff, nextId: 1 };
}

function id(prefix, state) {
  const value = `${prefix}_${state.nextId}`;
  state.nextId += 1;
  return value;
}

export function getStore() {
  if (!globalThis.__resourceStore) {
    globalThis.__resourceStore = createSeed();
  }
  return globalThis.__resourceStore;
}

export { id, taskStatuses, timeOffTypes };
