export function calculateSalary(params: {
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  lateCount: number;
  latePenalty: number;
}) {
  const grossSalary = params.baseSalary + params.overtimeHours * params.overtimeRate;
  const netSalary = grossSalary - params.lateCount * params.latePenalty;
  return {grossSalary, netSalary};
}