import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {TextInput, Button, Card} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {register} from '../store/slices/authSlice';
import {RootState, AppDispatch} from '../store';
import ErrorBanner from '../components/ErrorBanner';
import LoadingOverlay from '../components/LoadingOverlay';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({navigation}) => {
  const [name, setName] = useState('John Doe');
  const [employeeId, setEmployeeId] = useState('EMP001');
  const [email, setEmail] = useState('john@company.com');
  const [password, setPassword] = useState('password');
  const [designation, setDesignation] = useState('Nurse');
  const [department, setDepartment] = useState('Emergency');
  const dispatch = useDispatch<AppDispatch>();
  const {loading, error} = useSelector((s: RootState) => s.auth);

  const onRegister = async () => {
    const res = await dispatch(
      register({name, employeeId, email, password, designation, department}),
    );
    if ((res as any).type?.endsWith('fulfilled')) {
      navigation.replace('Dashboard');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Employee Registration" />
        <Card.Content>
          <ErrorBanner message={error} />
          <TextInput label="Name" value={name} onChangeText={setName} />
          <TextInput label="Employee ID" value={employeeId} onChangeText={setEmployeeId} />
          <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput label="Designation" value={designation} onChangeText={setDesignation} />
          <TextInput label="Department" value={department} onChangeText={setDepartment} />
          <Button mode="contained" style={styles.button} onPress={onRegister}>
            Register
          </Button>
        </Card.Content>
      </Card>
      {loading && <LoadingOverlay />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', padding: 16},
  card: {padding: 8},
  button: {marginTop: 16},
});

export default RegisterScreen;