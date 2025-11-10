import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import SalarySummaryScreen from '../screens/SalarySummaryScreen';
import {useDispatch, useSelector} from 'react-redux';
import {loadSession} from '../store/slices/authSlice';
import {RootState, AppDispatch} from '../store';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Attendance: undefined;
  Salary: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);

  const initialRouteName = user ? 'Dashboard' : 'Login';

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{headerShown: false}}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Attendance" component={AttendanceScreen} />
          <Stack.Screen name="Salary" component={SalarySummaryScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;