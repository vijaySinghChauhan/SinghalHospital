import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {TextInput, Button, Text, Card} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {login} from '../store/slices/authSlice';
import {RootState, AppDispatch} from '../store';
import ErrorBanner from '../components/ErrorBanner';
import LoadingOverlay from '../components/LoadingOverlay';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState('john@company.com');
  const [password, setPassword] = useState('password');
  const dispatch = useDispatch<AppDispatch>();
  const {loading, error, user} = useSelector((s: RootState) => s.auth);

  const onLogin = async () => {
    const res = await dispatch(login({email, password}));
    if ((res as any).type?.endsWith('fulfilled')) {
      navigation.replace('Dashboard');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Employee Login" />
        <Card.Content>
          <ErrorBanner message={error} />
          <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Button mode="contained" style={styles.button} onPress={onLogin}>
            Login
          </Button>
          <Button onPress={() => navigation.navigate('Register')}>Register</Button>
        </Card.Content>
      </Card>
      {loading && <LoadingOverlay />}
      {user && <Text style={styles.debug}>Logged in as {user.name}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', padding: 16},
  card: {padding: 8},
  button: {marginTop: 16},
  debug: {textAlign: 'center', marginTop: 12, opacity: 0.6},
});

export default LoginScreen;