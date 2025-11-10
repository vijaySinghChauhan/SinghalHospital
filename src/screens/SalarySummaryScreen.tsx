import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text, DataTable, Button} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../store';
import {fetchSalary} from '../store/slices/salarySlice';

const SalarySummaryScreen = () => {
  const {user} = useSelector((s: RootState) => s.auth);
  const {summary, loading} = useSelector((s: RootState) => s.salary);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (user) dispatch(fetchSalary(user.employeeId));
  }, [user, dispatch]);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Salary Summary" />
        <Card.Content>
          {!summary ? (
            <Text>Loading...</Text>
          ) : (
            <DataTable>
              <DataTable.Row>
                <DataTable.Cell>Total working days</DataTable.Cell>
                <DataTable.Cell numeric>{summary.totalDaysPresent}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>Overtime hours</DataTable.Cell>
                <DataTable.Cell numeric>{summary.overtimeHours}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>Late days</DataTable.Cell>
                <DataTable.Cell numeric>{summary.lateCount}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>Gross salary</DataTable.Cell>
                <DataTable.Cell numeric>₹{summary.grossSalary}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>Net salary</DataTable.Cell>
                <DataTable.Cell numeric>₹{summary.netSalary}</DataTable.Cell>
              </DataTable.Row>
            </DataTable>
          )}
          <Button mode="outlined" style={styles.button} disabled={loading}>
            Refresh
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

export default SalarySummaryScreen;