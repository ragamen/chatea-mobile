import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator
} from 'react-native';
// 🚨 Asume que puedes importar el cliente de Supabase desde tus servicios
// (Mencionado en tu proyecto-chatea-mobile.txt como src/services/supabaseClient)
import { supabase } from '../src/services/supabaseClient'; 

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Alterna entre Login y Registro
  const [loading, setLoading] = useState(false);

  // Función principal para manejar tanto el login como el registro
  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "El email y la contraseña son requeridos.");
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        // --- Lógica de INICIO DE SESIÓN ---
        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;
        // Si tiene éxito, el `useSession` en `app/_layout.tsx` redirige automáticamente a la pestaña (tabs).
        
      } else {
        // --- Lógica de REGISTRO (SIGN UP) ---
        const { error } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        if (error) throw error;
        
        // Si el registro es exitoso, Supabase inicia sesión inmediatamente.
        // Alertamos al usuario y el sistema de navegación se encarga del resto.
        Alert.alert("Verifica tu email", "Hemos enviado un enlace de confirmación a tu correo electrónico.");
      }
    } catch (error: any) {
      // Manejo de errores específicos
      const message = error.message || "Error desconocido durante la autenticación.";
      Alert.alert("Error de Autenticación", message);
    } finally {
      setLoading(false);
    }
  };

  const buttonText = isLogin ? 'Iniciar Sesión' : 'Registrarse';
  const switchText = isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{buttonText}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>{buttonText}</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.switchButton} 
        onPress={() => setIsLogin(!isLogin)}
        disabled={loading}
      >
        <Text style={styles.switchText}>{switchText}</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 18,
    backgroundColor: '#F9F9F9',
  },
  button: {
    width: '100%',
    backgroundColor: '#075E54', // Color de WhatsApp
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchText: {
    color: '#075E54',
    fontSize: 16,
    fontWeight: '600',
  }
});