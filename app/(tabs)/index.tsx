// app/(tabs)/index.tsx (ARCHIVO COMPLETO Y FINAL)
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { router } from 'expo-router'; 
import { useSocketContext } from '../../src/context/SocketContext';
import { useSessionContext } from '../../src/context/SessionContext'; 
import ChatListScreen from '../../src/screens/ChatListScreen'; 

export default function ChatListPage() {
  // 1. OBTENER DATOS DE CONTEXTO... (omitiendo por brevedad, el resto es correcto)
  const { isConnected, onlineStatuses } = useSocketContext(); 
  const { 
    userProfile, amigos, pendingRequests, onLogout, handleAcceptRequest, handleRejectRequest 
  } = useSessionContext(); 

  // --- Función de Navegación: SOLUCIÓN AL ERROR DE TIPADO ---
  const handleNavigateToChat = (chatId: string, partnerName: string) => {
    // 🚀 CORRECCIÓN: Usamos la sintaxis de objeto para router.push()
    router.push({
      // 1. pathname: La estructura de la carpeta/archivo
      pathname: "/chat/[id]" as any, // Asumiendo que tu archivo es app/chat/[id].tsx
      // 2. params: Los valores que se inyectan en [id] y como query params
      params: {
        id: chatId,          // Se convierte en la parte dinámica de la ruta (/chat/123)
        name: partnerName    // Se convierte en el query param (?name=...)
      }
    });
  };
  
  if (!userProfile) {
    return <View style={styles.container}><Text>Cargando datos...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <ChatListScreen
        onlineStatuses={onlineStatuses}
        isConnected={isConnected}
        onSelectChat={handleNavigateToChat} // Pasamos la función corregida
        userProfile={userProfile}
        amigos={amigos}
        pendingRequests={pendingRequests}
        onLogout={onLogout}
        handleAcceptRequest={handleAcceptRequest}
        handleRejectRequest={handleRejectRequest}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});