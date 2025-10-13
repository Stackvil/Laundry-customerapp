import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CurrentLocationExample() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Current location UI has been removed from this build.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { color: '#333', fontSize: 16 },
});
