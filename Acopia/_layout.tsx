import React from 'react';
import { Stack, Redirect } from 'expo-router'; // Necesitamos Redirect
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useSession } from '../src/hooks/useSession'; // ⬅️ Importamos nuestro hook

// Definimos las rutas como constantes y las forzamos a 'any'
// Esta es la solución más robusta cuando TypeScript no reconoce las rutas.
const AUTH_ROUTE: any = "/auth";
const SETUP_ROUTE: any = "/screens/UsernameSetupScreen";

export default function RootLayout() {
  const { session, userProfile, isLoading } = useSession(); 

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#075E54" />
      </View>
    );
  }

  // --- Lógica de Navegación Condicional ---
  
  // 1. Sin Sesión: Va a la pantalla de autenticación
  if (!session) {
    // 🚨 CORRECCIÓN: Usamos la constante con la aserción de tipo
    return <Redirect href={AUTH_ROUTE} />; 
  }
  
  // 2. Con Sesión, pero sin Nombre de Usuario: Va al Setup
  if (session && userProfile && !userProfile.username) {
    // 🚨 CORRECCIÓN: Usamos la constante con la aserción de tipo
    return <Redirect href={SETUP_ROUTE} />;
  }

  // 3. Con Sesión y Perfil Completo: Va a la App Principal (Tabs)
  return (
    <Stack>
      {/* 🚨 Importante: El 'name' del Stack.Screen debe coincidir con la ruta pública */}
      <Stack.Screen name="auth" options={{ headerShown: false }} /> 
      <Stack.Screen name="screens/UsernameSetupScreen" options={{ headerShown: false }} /> 
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> 
      
      {/* Rutas secundarias */}
      <Stack.Screen 
        name="chat/[id]" 
        options={{ 
          headerShown: true, 
          headerTitle: 'Chat',
          headerStyle: { backgroundColor: '#075E54' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen name="CallScreen" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="AddFriendModal" options={{ presentation: 'modal' }} />
      
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});