import React, {useEffect} from 'react';
import {enableScreens} from 'react-native-screens';
import {Provider as ReduxProvider} from 'react-redux';
import {PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import store from './src/store';

const App = () => {
  enableScreens(true);
  useEffect(() => {
    // Potential place to initialize services
  }, []);

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
};

export default App;
