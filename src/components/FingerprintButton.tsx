import React, {useState} from 'react';
import {Button} from 'react-native-paper';
import {verifyBiometric} from '../services/biometric';

const FingerprintButton = ({onVerified}: {onVerified: () => void}) => {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    const ok = await verifyBiometric();
    setLoading(false);
    if (ok) onVerified();
  };

  return (
    <Button mode="contained" onPress={handlePress} loading={loading} icon="fingerprint">
      Verify Fingerprint
    </Button>
  );
};

export default FingerprintButton;