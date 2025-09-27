// App.js (Definitivo para React Native)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, AppState } from 'react-native';
import { supabase } from './services/supabaseClient'; // Cliente de Supabase configurado
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { io } from 'socket.io-client';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeSocket } from './services/socketService'; // Usamos el servicio de socket
import useWebRTC from './hooks/useWebRTC'; // Importamos el hook de WebRTC
import toast from 'react-hot-toast'; // Opcional, si lo usas con una librería RN
import { SOCKET_SERVER_URL } from '@env'; // Importamos de react-native-dotenv

// --- Importamos las pantallas ---
import AuthScreen from './screens/AuthScreen'; 
import UsernameSetupScreen from './screens/UsernameSetupScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import AddFriendScreen from './screens/AddFriendScreen'; 
import CallScreen from './screens/CallScreen'; 

const Stack = createNativeStackNavigator();
const PENDING_FILE_KEY = 'pending-upload-file';

function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [friendsList, setFriendsList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const socketRef = useRef(null);

  // --- LÓGICA DE BACKEND / SUPABASE ---

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  }, []);

  const fetchPendingRequests = useCallback(async (email) => {
    // Reemplazamos localStorage por AsyncStorage
    if (await AsyncStorage.getItem(PENDING_FILE_KEY)) {
      console.log("⏳ Hay un archivo pendiente. Omitiendo verificación de solicitudes.");
      return;
    }
    if (!email) return;

    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`id, user_id, friend_email, friend_username, status, profiles:user_id (id, username, avatar_url, email)`)
        .or(`friend_email.eq.${email}, friend_email_received.eq.${email}`)
        .eq('status', 'pending');

      if (error) throw error;
      
      const enrichedData = data.map(req => ({
        ...req,
        senderProfile: req.profiles
      }));
      setPendingRequests(enrichedData);
    } catch (err) {
      console.error('fetchPendingRequests: Error:', err);
      setPendingRequests([]);
    }
  }, []);

  const fetchAcceptedFriends = useCallback(async (userId, userEmail) => {
    try {
      // Tu lógica de fetchAcceptedFriends se mantiene igual, ya que solo interactúa con Supabase.
      // ... (Toda la lógica de fetchAcceptedFriends, incluyendo el mapeo y Promise.all)
      
      const { data: friendsRaw, error: friendsError } = await supabase
        .from('friends')
        .select(`id, user_id, friend_email, user_username, friend_username, status, created_at, chat_id`)
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .or(`user_id.eq.${userId}, friend_email.eq.${userEmail}`);
        
      if (friendsError) throw friendsError;
        
      // El mapeo y la búsqueda de perfiles se mantienen iguales
      const mappedFriends = await Promise.all(
        (friendsRaw || []).map(async (f) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .eq('email', f.friend_email)
              .single();
            if (!profile) return null;
            return {
              id: profile.id,
              username: profile.username,
              avatar_url: profile.avatar_url,
              chat_id: f.chat_id,
              isOnline: !!onlineUsers[profile.id], // Añadimos el estado de online
            };
        })
      );
      setFriendsList(mappedFriends.filter(Boolean));
    } catch (error) {
      console.error('Error en fetchAcceptedFriends:', error);
      setFriendsList([]);
    }
  }, [onlineUsers]); // onlineUsers es una dependencia crucial

  const handleAcceptRequest = useCallback(async (requestId, friendData) => {
    // Tu lógica de handleAcceptRequest (crear chat, añadir miembros, actualizar 'friends')
    // se mantiene IGUAL, ya que solo usa la API de Supabase.
    // Solo debes asegurar que `setFriendsList` y `setPendingRequests` actualicen el estado correctamente.
    // ... (Toda la lógica de Supabase)
    try {
        const { data: { session } = {} } = await supabase.auth.getSession();
        if (!session || !session.user) throw new Error('No se pudo obtener la sesión del usuario.');
        const currentUserId = session.user.id;

        const { data: newChat, error: chatError } = await supabase.from('chats').insert({ type: 'private' }).select('id').single();
        if (chatError) throw chatError;
        const newChatId = newChat.id;

        const friendId = friendData.id;
        if (!friendId) throw new Error('No se pudo obtener el ID del amigo.');

        const { error: membersError } = await supabase.from('chat_members').insert([
            { chat_id: newChatId, user_id: currentUserId },
            { chat_id: newChatId, user_id: friendId }
        ]);
        if (membersError) throw membersError;

        const { error: updateError } = await supabase.from('friends').update({ status: 'accepted', chat_id: newChatId }).eq('id', requestId);
        if (updateError) throw updateError;

        const { error: newEntryError } = await supabase.from('friends').insert({
            user_id: currentUserId,
            user_username: userProfile.username,
            friend_email: friendData.email,
            friend_username: friendData.username,
            status: 'accepted',
            chat_id: newChatId
        });
        if (newEntryError) throw newEntryError;

        setFriendsList(prevList => [...prevList, {
            id: friendId, // Usar el ID del amigo para consistencia
            username: friendData.username,
            avatar_url: friendData.avatar_url,
            chat_id: newChatId,
            isOnline: !!onlineUsers[friendId],
        }]);

        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        toast.success('¡Solicitud aceptada! 🎉');
    } catch (err) {
        console.error('Error al aceptar la solicitud:', err);
        toast.error('Error al aceptar la solicitud.');
    }
  }, [userProfile, onlineUsers]);
  
  const handleRejectRequest = useCallback(async (requestId) => {
    try {
      const { error } = await supabase.from('friends').delete().eq('id', requestId);
      if (error) throw error;
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      toast.success('Solicitud rechazada.');
    } catch (err) {
      console.error('Error al rechazar la solicitud:', err);
      toast.error('Error al rechazar la solicitud.');
    }
  }, []);

  const loadUserData = useCallback(async (user) => {
    if (!user) return;
    setLoadingProfile(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, email')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setUserProfile(profileData);
        await Promise.all([
          fetchPendingRequests(profileData.email),
          fetchAcceptedFriends(profileData.id, profileData.email)
        ]);
      } else {
        setUserProfile({ id: user.id, email: user.email, username: null }); // Sesión activa, pero falta username
      }
    } catch (err) {
      console.error('Error en loadUserData:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, [fetchPendingRequests, fetchAcceptedFriends]);

  // --- EFECTO DE AUTENTICACIÓN SUPABASE (SIN CAMBIOS) ---
  useEffect(() => {
    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession);
      if (newSession) {
        loadUserData(newSession.user);
      } else {
        setUserProfile(null);
        setFriendsList([]);
        setPendingRequests([]);
        setLoadingProfile(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } = {} }) => {
      setSession(session);
      if (session) loadUserData(session.user);
      else setLoadingProfile(false);
    });

    return () => subscription?.unsubscribe();
  }, [loadUserData]);
  
  // --- EFECTO DE SOCKET.IO ---
  useEffect(() => {
    if (!session || socketRef.current) return;
    
    // Usamos el servicio de inicialización para simplificar
    const newSocket = initializeSocket(session); 
    if (!newSocket) return;

    socketRef.current = newSocket;

    const handleConnect = () => {
      console.log("✅ Socket conectado:", newSocket.id);
      if (userProfile?.id) {
        newSocket.emit("registerUser", userProfile.id);
      }
    };

    const handleOnlineUsers = (onlineUsersMap) => setOnlineUsers(onlineUsersMap);

    newSocket.on("connect", handleConnect);
    newSocket.on("onlineUsers", handleOnlineUsers);
    
    return () => {
      if (newSocket) {
        newSocket.off("connect", handleConnect);
        newSocket.off("onlineUsers", handleOnlineUsers);
        // NO desconectamos aquí si la sesión está activa, solo limpiamos listeners
      }
    };
  }, [session]);
  
  // --- WEBRTC (HOOK GLOBAL) ---
  // 💡 NOTA: Debes usar un componente que tenga acceso a `useNavigation()` 
  // para que `onCallStart` pueda funcionar correctamente.
  // Por simplicidad en `App.js`, definimos el callback de navegación aquí:
  const CallScreenNavigator = ({ children }) => {
    const navigation = useNavigation();
    const handleCallStartNavigation = useCallback(() => {
        if (navigation) {
            navigation.navigate('CallScreen');
        } else {
            console.error("Navigation object is not available for WebRTC call.");
        }
    }, [navigation]);

    // Estados y funciones de useWebRTC se definen aquí
    const {
        remoteStream, localStreamState, videoEnabled, isMuted,
        toggleMute, toggleVideo, endCall, reconnectStatus,
        incomingCall, currentCall, handleStartCall, handleAcceptCall
    } = useWebRTC({
        socket: socketRef.current,
        userProfile,
        amigos: friendsList,
        onCallStart: handleCallStartNavigation, // Pasamos el callback
    });

    // Pasamos el WebRTC state y handlers a los hijos usando React Context o props
    // Aquí los pasamos como props a los screens principales
    const webRTCHandlers = {
        remoteStream, localStreamState, videoEnabled, isMuted,
        toggleMute, toggleVideo, endCall, reconnectStatus,
        incomingCall, currentCall, handleStartCall, handleAcceptCall
    };

    return children({ webRTCHandlers });
  };
  
  // Si estás cargando el perfil, muestra un indicador de actividad
  if (loadingProfile) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // --- NAVEGADOR DE PILA (STACK NAVIGATOR) ---
  return (
    <NavigationContainer>
        {/* Usamos un componente Wrapper para inyectar el estado de WebRTC globalmente */}
        <CallScreenNavigator>
            {({ webRTCHandlers }) => (
                <Stack.Navigator>
                    {/* 1. Sin Sesión: Autenticación */}
                    {!session ? (
                        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
                    ) : (
                        /* 2. Con Sesión: Verifica Perfil */
                        !userProfile || !userProfile.username ? (
                            <Stack.Screen 
                                name="UsernameSetup"
                                children={(props) => (
                                    <UsernameSetupScreen {...props} session={session} setUserProfile={setUserProfile} />
                                )}
                                options={{ title: 'Elige tu Nombre', headerShown: false }}
                            />
                        ) : (
                            /* 3. App Principal (Con Sesión y Perfil) */
                            <>
                                <Stack.Screen 
                                    name="ChatList"
                                    children={(props) => (
                                        <ChatListScreen
                                            {...props}
                                            userProfile={userProfile}
                                            amigos={friendsList}
                                            pendingRequests={pendingRequests}
                                            onLogout={handleLogout}
                                            handleAcceptRequest={handleAcceptRequest}
                                            handleRejectRequest={handleRejectRequest}
                                            incomingCall={webRTCHandlers.incomingCall}
                                            handleAcceptCall={webRTCHandlers.handleAcceptCall}
                                            endCall={webRTCHandlers.endCall}
                                        />
                                    )}
                                    options={{ title: 'Chats', headerLargeTitle: true }}
                                />
                                <Stack.Screen 
                                    name="ChatDetail" 
                                    children={(props) => (
                                        <ChatDetailScreen
                                            {...props}
                                            userProfile={userProfile}
                                            socket={socketRef.current}
                                            onlineUsers={onlineUsers}
                                            // Handlers de WebRTC
                                            handleStartCall={webRTCHandlers.handleStartCall}
                                            handleAcceptCall={webRTCHandlers.handleAcceptCall}
                                            endCall={webRTCHandlers.endCall}
                                            incomingCall={webRTCHandlers.incomingCall}
                                            currentCall={webRTCHandlers.currentCall}
                                        />
                                    )}
                                    options={{ title: 'Chat' }}
                                />
                                <Stack.Screen
                                    name="AddFriendModal"
                                    component={AddFriendScreen}
                                    options={{ title: 'Agregar Amigo', presentation: 'modal' }}
                                />
                                <Stack.Screen
                                    name="CallScreen"
                                    options={{ headerShown: false, presentation: 'fullScreenModal' }}
                                    children={(props) => (
                                        <CallScreen
                                            {...props}
                                            {...webRTCHandlers} // Pasamos todos los estados y handlers de WebRTC
                                        />
                                    )}
                                />
                            </>
                        )
                    )}
                </Stack.Navigator>
            )}
        </CallScreenNavigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 10,
    color: '#4F46E5',
    fontSize: 16,
  }
});

export default App;