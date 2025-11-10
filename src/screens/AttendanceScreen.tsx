import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text, Button, RadioButton} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../store';
import FingerprintButton from '../components/FingerprintButton';
import {markAttendance} from '../store/slices/attendanceSlice';

const AttendanceScreen = () => {
  const {user} = useSelector((s: RootState) => s.auth);
  const {loading} = useSelector((s: RootState) => s.attendance as {loading: boolean});
  const dispatch = useDispatch<AppDispatch>();
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [verified, setVerified] = useState(false);

  const onVerified = () => setVerified(true);

  const onMark = async () => {
    if (!user) return;
    const timestamp = new Date().toISOString();
    await dispatch(
      markAttendance({employeeId: user.employeeId, timestamp, type}),
    );
    setVerified(false);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Mark Attendance" />
        <Card.Content>
          <Text>Employee ID: {user?.employeeId}</Text>
          <View style={styles.row}>
            <RadioButton.Group onValueChange={v => setType(v as any)} value={type}>
              <View style={styles.row}>
                <RadioButton value="IN" />
                <Text>IN</Text>
                <RadioButton value="OUT" />
                <Text>OUT</Text>
              </View>
            </RadioButton.Group>
          </View>
          {!verified ? (
            <FingerprintButton onVerified={onVerified} />
          ) : (
            <Button mode="contained" onPress={onMark} loading={loading}>
              Submit Attendance
            </Button>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', padding: 16},
  card: {padding: 8},
  row: {flexDirection: 'row', alignItems: 'center', gap: 8},
});

export default AttendanceScreen;