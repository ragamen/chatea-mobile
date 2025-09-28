// src/screens/CallScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Video, Mic, PhoneOff, Maximize2, X } from 'lucide-react-native'; 
import { RTCView } from 'react-native-webrtc'; // El componente clave
import { useNavigation } from '@react-navigation/native';

const CallScreen = ({ 
  currentCall, 
  remoteStream, 
  localStreamState, 
  videoEnabled, 
  isMuted, 
  toggleMute, 
  toggleVideo, 
  endCall,
  reconnectStatus,
}) => {
  const navigation = useNavigation();

  // Asegúrate de que solo se muestre el video si la pista está habilitada
  const remoteStreamURL = remoteStream?.toURL();
  // El local stream se renderiza solo si el video está activado por el usuario
  const localStreamURL = videoEnabled && localStreamState ? localStreamState.toURL() : null;

  const handleEndCall = () => {
      endCall();
      // Opcional: Navegar de vuelta a la pantalla de detalle del chat
      if (navigation.canGoBack()) {
          navigation.goBack(); 
      } else {
          navigation.navigate('ChatList');
      }
  };

  return (
    <View style={styles.container}>
      
      {/* 📞 Video Remoto (Fondo principal) */}
      <View style={styles.remoteVideoContainer}>
        {remoteStreamURL ? (
          <RTCView 
            streamURL={remoteStreamURL}
            objectFit="cover" // Estira para cubrir el área
            style={styles.fullScreenVideo} 
          />
        ) : (
          // Vista de carga o solo audio
          <View style={styles.placeholder}>
            <Text style={styles.partnerName}>Llamada con {currentCall?.partnerUsername}</Text>
            {reconnectStatus ? (
                <Text style={styles.statusText}>{reconnectStatus}</Text>
            ) : (
                <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
            )}
            
          </View>
        )}
      </View>

      {/* 📷 Video Local (Miniatura) */}
      {localStreamURL && (
        <View style={styles.localVideoWrapper}>
          <RTCView
            streamURL={localStreamURL}
            objectFit="cover"
            mirror={true} // Cámara frontal
            style={styles.localVideo}
          />
        </View>
      )}

      {/* Controles de Llamada */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.controlsBar}>
          {/* Botón Mute */}
          <TouchableOpacity onPress={toggleMute} style={[styles.controlButton, { backgroundColor: isMuted ? '#FF3B30' : 'rgba(255,255,255,0.2)' }]}>
            <Mic color="white" size={24} />
          </TouchableOpacity>

          {/* Botón Video ON/OFF */}
          <TouchableOpacity onPress={toggleVideo} style={[styles.controlButton, { backgroundColor: videoEnabled ? 'rgba(255,255,255,0.2)' : '#FF3B30' }]}>
            <Video color="white" size={24} />
          </TouchableOpacity>
          
          {/* Botón Colgar */}
          <TouchableOpacity onPress={handleEndCall} style={[styles.controlButton, styles.endCallButton]}>
            <PhoneOff color="white" size={28} />
          </TouchableOpacity>

          {/* Botón de Minimizar (Placeholder UX) */}
          <TouchableOpacity onPress={() => console.log('Implementar minimizado')} style={styles.controlButton}>
            <Maximize2 color="white" size={24} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  remoteVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#ccc',
    fontSize: 18,
    marginTop: 10,
  },
  localVideoWrapper: {
    position: 'absolute',
    top: 60, 
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden', 
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  endCallButton: {
    backgroundColor: '#FF3B30', 
    width: 70,
    height: 70,
    borderRadius: 35,
  },
});

export default CallScreen;