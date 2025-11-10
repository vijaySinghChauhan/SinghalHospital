import React from 'react';
import {Text} from 'react-native-paper';
import {View, StyleSheet} from 'react-native';

const ErrorBanner = ({message}: {message?: string | null}) => {
  if (!message) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffebee',
    borderColor: '#e53935',
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  text: {
    color: '#c62828',
  },
});

export default ErrorBanner;