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
import { useRouter } from 'expo-router';

// 🚨 RUTA CORREGIDA: Asumimos que la ruta correcta para tu cliente Supabase es '../services/supabaseClient'
// ya que 'UsernameSetupScreen.tsx' está en 'screens/' y 'supabaseClient.js' en 'src/services/'
// Si el archivo está en 'app/screens', la ruta correcta sería:
import { supabase } from '../services/supabaseClient'; // Ajusta la ruta a la ubicación real de tu archivo


// Esta pantalla se encarga de que el usuario establezca su nombre público
export default function UsernameSetupScreen() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Función que maneja el envío del nombre de usuario a Supabase
  const handleSaveUsername = async () => {
    if (username.trim().length < 3) {
      Alert.alert("Error", "El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Obtener la sesión actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert("Error", "No hay un usuario autenticado.");
        // 🚨 CORRECCIÓN 1: Asegura que la ruta de Auth es la pública:
         router.replace('/auth' as any);
        return;
      }
      
      // 2. Actualizar la tabla 'profiles' con el nuevo nombre de usuario
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user.id); 

      if (error) {
        if (error.code === '23505') { 
            Alert.alert("Error", "Ese nombre de usuario ya está en uso. Por favor, elige otro.");
        } else {
            console.error('Error al guardar el username:', error);
            Alert.alert("Error", "No se pudo guardar el nombre de usuario. Inténtalo de nuevo.");
        }
        return;
      }

      // 3. Éxito: Navegar a la pantalla principal (Lista de Chats)
      Alert.alert("Éxito", `¡Bienvenido, ${username}!`);
      // 🚨 CORRECCIÓN 2: La ruta pública de la pestaña principal es '/' (o '/index')
      // Si tu index está en app/(tabs)/index.tsx, la ruta es solo '/'. 
      // Si el index principal está en app/(tabs)/index.tsx, la ruta canónica es la base de las pestañas:
      router.replace('/'); 
      // ☝️ O si realmente necesitas el index explícito del grupo tabs:
      // router.replace('/index'); // Ojo, esta solo si (tabs)/index.tsx es tu ruta principal
      // Usemos la forma más segura para apuntar a la base de las tabs:
      
    } catch (e) {
      console.error('Error inesperado:', e);
      Alert.alert("Error", "Ocurrió un error inesperado al guardar el usuario.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... (El resto del código de la vista es el mismo)
    <View style={styles.container}>
      <Text style={styles.title}>Elige tu Nombre de Usuario</Text>
      <Text style={styles.subtitle}>Este será tu nombre público en la aplicación.</Text>

      <TextInput
        style={styles.input}
        placeholder="Tu nombre de usuario único"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        maxLength={30}
        editable={!isLoading}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSaveUsername}
        disabled={isLoading || username.trim().length < 3}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Comenzar a Chatear</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ... (El resto de los estilos son iguales)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    marginBottom: 20,
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
});