import React, { useRef, useState, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
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
  const isNavigatingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Reset navigation flag when screen comes into focus (but don't clear form)
  useFocusEffect(
    useCallback(() => {
      isNavigatingRef.current = false;
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, [])
  );

  const handleSignUp = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (loading || isNavigatingRef.current) {
      return;
    }

    // Validate all fields are filled
    if (!name || !email || !mobile || !password || !address) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Basic password validation
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Basic mobile validation
    if (mobile.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    try {
      // Call signUp with trimmed and validated data
      await signUp(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        mobile.trim(),
        address.trim()
      );
      
      // Mark as navigating to prevent re-renders
      isNavigatingRef.current = true;
      isMountedRef.current = false;
      
      // Navigate immediately - don't update any state to prevent blinking
      // The component will unmount after navigation completes
      router.replace('/(tabs)/home');
    } catch (error: any) {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        isNavigatingRef.current = false;
        setLoading(false);
        
        // Safely extract error message without JSON parsing
        let errorMessage = 'Signup failed. Please try again.';
        
        if (error) {
          // Handle error messages
          if (error.message && typeof error.message === 'string') {
            errorMessage = error.message;
          } 
          // Handle other error types
          else if (typeof error === 'string') {
            errorMessage = error;
          } else if (error.error_description) {
            errorMessage = error.error_description;
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.originalError) {
            // If there's an original error wrapped
            errorMessage = error.message || 'Authentication error occurred';
          } else {
            // If error is an object, try to get a meaningful message
            try {
              const errorStr = JSON.stringify(error);
              if (errorStr.length > 200) {
                errorMessage = 'An error occurred during signup. Please try again.';
              } else {
                errorMessage = errorStr;
              }
            } catch {
              errorMessage = 'An unknown error occurred';
            }
          }
        }
        
        console.error('Signup error details:', {
          message: error?.message,
          status: error?.status,
          code: error?.code,
          fullError: error,
        });
        Alert.alert('Signup Error', errorMessage);
      }
    }
  }, [name, email, mobile, password, address, loading, signUp, router]);

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
            style={loading ? styles.buttonDisabled : styles.button}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
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
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 52,
  },
  buttonDisabled: {
    backgroundColor: '#999',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 52,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  switchText: { textAlign: 'center', color: '#070707', marginTop: 12, fontSize: 14 },
});
