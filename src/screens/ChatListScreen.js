// src/screens/ChatListScreen.js (CÓDIGO FINAL Y CORREGIDO)

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
// 💡 Mantenemos useNavigation si queremos navegar a MODALES (ej. AddFriendScreen)
import { useNavigation } from '@react-navigation/native'; 
import { LogOut, UserPlus, BellRing } from 'lucide-react-native'; 
import Avatar from '../components/Avatar'; 

const ChatListScreen = ({
  onlineStatuses, // { id: 'online' | 'offline' }
  isConnected,    // boolean
  onSelectChat,   // (chatId, partnerUsername) => void
  userProfile,    
  amigos,         
  pendingRequests,
  onLogout,
  handleAcceptRequest,
  handleRejectRequest,
}) => {
    // Necesario solo si AddFriendModal y PendingRequestsScreen son modales
    const navigation = useNavigation();

  // ------------------------------------------------------------------
  // 1. Manejadores de Interacción
  // ------------------------------------------------------------------
  
  // CAMBIO CLAVE 1: Usar el prop onSelectChat para delegar la navegación de la ruta
  const handleSelectChat = (amigo) => {
    // Ya no usamos navigation.navigate('ChatDetail', ...).
    // Llamamos al prop que usa el router de Expo.
    onSelectChat(amigo.chat_id, amigo.username); 
  };

  // Reemplaza el modal de "Agregar Amigo"
  const handleAddFriend = () => {
    navigation.navigate('AddFriendModal'); // Navega a la pantalla modal
  };

  // ------------------------------------------------------------------
  // 2. Componente de Fila para cada Chat
  // ------------------------------------------------------------------

  const ChatRow = ({ item }) => {
    // CAMBIO CLAVE 2: Obtener el estado de conexión del prop 'onlineStatuses'
    const isFriendOnline = onlineStatuses && onlineStatuses[item.id] === 'online'; 

    return (
      <TouchableOpacity style={styles.chatRow} onPress={() => handleSelectChat(item)}>
        <Avatar username={item.username} avatarUrl={item.avatar_url} size="md" />
        <View style={styles.chatInfo}>
          <Text style={styles.chatUsername} numberOfLines={1}>{item.username}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {/* Usamos la variable corregida */}
            {isFriendOnline ? '🟢 En línea' : '⚫ Desconectado'}
          </Text>
        </View>
      </TouchableOpacity>
  );
};
      
 

  // ------------------------------------------------------------------
  // 4. Renderizado Principal
  // ------------------------------------------------------------------

  return (
    <View style={styles.container}>
      
      {/* 4.1. Cabecera (Header se gestiona mejor con options de Stack) */}
      <View style={styles.header}>
        {/* Perfil de Usuario y Logout */}
        <View style={styles.profileContainer}>
          <Avatar username={userProfile.username} avatarUrl={userProfile.avatar_url} size="lg" />
          <Text style={styles.profileUsername}>{userProfile.username}</Text>
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <LogOut color="red" size={20} />
          </TouchableOpacity>
        </View>

        {/* Botón Agregar Amigo */}
        <TouchableOpacity onPress={handleAddFriend} style={styles.addFriendButton}>
          <UserPlus color="#3B82F6" size={24} />
        </TouchableOpacity>
      </View>

      {/* 4.2. Solicitudes Pendientes */}
      <PendingRequestsSection />
      
      {/* 4.3. Lista de Chats (Amigos) */}
      <FlatList
        data={amigos}
        renderItem={ChatRow}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes amigos. ¡Agrega uno!</Text>}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Un gris claro para el fondo
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0, // Usamos la cabecera nativa, quitamos el padding superior
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileUsername: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  logoutButton: {
    marginLeft: 15,
  },
  addFriendButton: {
    padding: 8,
  },
  pendingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10B981', // Verde para notificaciones
      padding: 12,
      marginHorizontal: 16,
      marginVertical: 10,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  pendingText: {
      color: 'white',
      marginLeft: 10,
      fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  chatInfo: {
    marginLeft: 12,
    flex: 1,
  },
  chatUsername: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280', // Gris
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 60, // Para que la línea empiece después del avatar
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#9CA3AF',
  }
});

export default ChatListScreen;