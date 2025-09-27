// src/screens/ChatListScreen.js

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LogOut, UserPlus, BellRing } from 'lucide-react-native'; // Usamos iconos para RN
import Avatar from '../components/Avatar'; // Tu componente Avatar migrado

const ChatListScreen = ({
  userProfile,
  amigos,
  pendingRequests,
  onLogout,
  handleAcceptRequest,
  handleRejectRequest,
}) => {
  const navigation = useNavigation();

  // ------------------------------------------------------------------
  // 1. Manejadores de Interacción
  // ------------------------------------------------------------------
  
  // Reemplaza la lógica de "seleccionar chat" del Sidebar
  const handleSelectChat = (amigo) => {
    // 💡 NOTA: La lógica de `handleSelectChatHook` debe ir ahora en ChatDetailScreen 
    // o un hook compartido. Aquí solo navegamos.
    
    // Navegamos a la pantalla de detalle, pasando el objeto amigo/chat
    navigation.navigate('ChatDetail', { 
        partnerUsername: amigo.username,
        chatId: amigo.chat_id,
        partnerId: amigo.id,
        isOnline: amigo.isOnline,
        // ... otras props necesarias
    });
  };

  // Reemplaza el modal de "Agregar Amigo"
  const handleAddFriend = () => {
    navigation.navigate('AddFriendModal'); // Navega a la pantalla modal
  };

  // ------------------------------------------------------------------
  // 2. Componente de Fila para cada Chat
  // ------------------------------------------------------------------

  const ChatRow = ({ item }) => (
    <TouchableOpacity style={styles.chatRow} onPress={() => handleSelectChat(item)}>
      <Avatar username={item.username} avatarUrl={item.avatar_url} size="md" />
      <View style={styles.chatInfo}>
        <Text style={styles.chatUsername} numberOfLines={1}>{item.username}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.isOnline ? '🟢 En línea' : '⚫ Desconectado'}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  // ------------------------------------------------------------------
  // 3. Solicitudes Pendientes (Reemplazo del Modal)
  // ------------------------------------------------------------------

  const PendingRequestsSection = () => {
      if (pendingRequests.length === 0) return null;
      
      const requestsCount = pendingRequests.length;

      // 💡 En lugar de un modal, mostramos un botón que lleva a una nueva pantalla
      const handleOpenRequests = () => {
          // Podrías crear una `PendingRequestsScreen` o usar Alert simple por ahora
          Alert.alert(
              'Solicitudes Pendientes',
              `Tienes ${requestsCount} solicitud(es) de amistad.`,
              // Aquí usarías la navegación para ir a una pantalla de gestión de solicitudes.
              [{ text: 'Ver', onPress: () => navigation.navigate('PendingRequestsScreen', { requests: pendingRequests }) }]
          );
      };
      
      return (
          <TouchableOpacity style={styles.pendingCard} onPress={handleOpenRequests}>
              <BellRing color="white" size={20} />
              <Text style={styles.pendingText}>
                {requestsCount} Solicitud{requestsCount > 1 ? 'es' : ''} pendiente
              </Text>
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