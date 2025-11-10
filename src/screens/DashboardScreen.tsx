import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text, Button} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../store';
import {logout} from '../store/slices/authSlice';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const DashboardScreen: React.FC<Props> = ({navigation}) => {
  const {user} = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch<AppDispatch>();

  const stats = {
    attendancePercent: 92,
    salaryThisMonth: 45500,
    overtimeHours: 10,
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={`Welcome, ${user?.name || 'Employee'}`} />
        <Card.Content>
          <Text>Attendance %: {stats.attendancePercent}</Text>
          <Text>Salary this month: ₹{stats.salaryThisMonth}</Text>
          <Text>Overtime hours: {stats.overtimeHours}</Text>
          <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('Attendance')}>
            Mark Attendance
          </Button>
          <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('Salary')}>
            View Salary Summary
          </Button>
          <Button mode="outlined" style={styles.button} onPress={() => dispatch(logout())}>
            Logout
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', padding: 16},
  card: {padding: 8},
  button: {marginTop: 12},
});

export default DashboardScreen;