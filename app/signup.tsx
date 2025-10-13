import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const mobileRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);

  const handleSignUp = async () => {
    if (!name || !email || !mobile || !password || !address) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // Make sure your signUp function in AuthContext accepts name as a parameter
      await signUp(name, email, password, mobile, address);
      Alert.alert('Success', 'Account created successfully!');
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Signup Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Sign Up</Text>

          {/* Name */}
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            blurOnSubmit={false}
          />

          {/* Email */}
          <TextInput
            ref={emailRef}
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => mobileRef.current?.focus()}
            blurOnSubmit={false}
          />

          {/* Mobile */}
          <TextInput
            ref={mobileRef}
            style={styles.input}
            placeholder="Mobile Number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
          />

          {/* Password */}
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="next"
            onSubmitEditing={() => addressRef.current?.focus()}
            blurOnSubmit={false}
          />

          {/* Address */}
          <TextInput
            ref={addressRef}
            style={[styles.input, { height: 100 }]}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            multiline
            returnKeyType="done"
            onSubmitEditing={handleSignUp}
          />

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.button, loading && { backgroundColor: '#999' }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
          </TouchableOpacity>

          {/* Switch to Login */}
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.switchText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#0a0a0a',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  switchText: { textAlign: 'center', color: '#070707', marginTop: 12, fontSize: 14 },
});
