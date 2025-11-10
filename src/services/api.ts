import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Config} from '../config';
import mockData from '../../assets/mock/mock.json';

const api = axios.create({
  baseURL: Config.baseURL,
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock mode handlers
if (Config.useMockApi) {
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const mockPost = async (url: string, data: any) => {
    await delay(500);
    if (url === '/api/auth/register') {
      const user = {
        name: data.name,
        employeeId: data.employeeId,
        email: data.email,
        designation: data.designation,
        department: data.department,
        baseSalary: 40000,
      };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', 'mock-token');
      return {data: {user, token: 'mock-token'}};
    }
    if (url === '/api/auth/login') {
      const user = mockData.users.find(u => u.email === data.email) || mockData.users[0];
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', 'mock-token');
      return {data: {user, token: 'mock-token'}};
    }
    if (url === '/api/attendance/mark') {
      const record = data;
      return {data: {record}};
    }
    throw new Error(`Mock POST not implemented for ${url}`);
  };

  const mockGet = async (url: string) => {
    await delay(500);
    if (url.startsWith('/api/salary/calculate/')) {
      const employeeId = url.split('/').pop() as string;
      const user = mockData.users.find(u => u.employeeId === employeeId) || mockData.users[0];
      const attendance = mockData.attendance.filter(a => a.employeeId === employeeId);
      const overtimeHours = mockData.overtime[employeeId] || 0;
      const lateCount = mockData.late[employeeId] || 0;
      const totalDaysPresent = new Set(attendance.map(a => a.timestamp.split('T')[0])).size;
      const overtimeRate = Config.overtimeRate;
      const latePenalty = Config.latePenalty;
      const grossSalary = user.baseSalary + overtimeHours * overtimeRate;
      const netSalary = grossSalary - lateCount * latePenalty;
      return {
        data: {
          summary: {
            employeeId,
            baseSalary: user.baseSalary,
            totalDaysPresent,
            overtimeHours,
            lateCount,
            overtimeRate,
            latePenalty,
            grossSalary,
            netSalary,
          },
        },
      };
    }
    throw new Error(`Mock GET not implemented for ${url}`);
  };

  // Override methods when in mock mode
  (api as any).post = (url: string, data: any) => mockPost(url, data);
  (api as any).get = (url: string) => mockGet(url);
}

export default api;
