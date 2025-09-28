// src/hooks/useWebRTC.js (MIGRADO A REACT NATIVE)

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
    mediaDevices, 
    RTCPeerConnection, 
    RTCIceCandidate, 
    RTCSessionDescription,
    // NO necesitamos RTCView aquí, se usa en CallScreen
} from 'react-native-webrtc'; 
import { AppState } from 'react-native'; // Para la gestión de segundo plano
import toast from 'react-hot-toast'; // Mantenemos el toast
// Importa tu archivo de utilidades si tienes la configuración del Peer
// import { peerConfiguration } from '../services/webrtcUtils'; 

// ** CONFIGURACIÓN DEL SERVIDOR ICE (Reemplaza con tu configuración real) **
const peerConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Agrega tus servidores TURN si tienes alguno
    ],
};

const useWebRTC = ({
    socket, // <-- Recibido desde WebRTCProvider
    userProfile, // <-- Recibido desde WebRTCProvider
    amigos,
    setMissedCall,
    onCallStart, 
}) => {
    // ESTADOS
    const [isCalling, setIsCalling] = useState(false); // Soy el que llama
    const [isInCall, setIsInCall] = useState(false); // La llamada está activa
    const [incomingCall, setIncomingCall] = useState(null); // Llamada entrante pendiente
    const [currentCall, setCurrentCall] = useState(null); // Detalles de la llamada activa
    const [remoteStream, setRemoteStream] = useState(null); // Stream de video/audio del otro usuario
    const [localStreamState, setLocalStreamState] = useState(null); // Stream local de video/audio
    const [videoEnabled, setVideoEnabled] = useState(true); // Estado de mi video
    const [isMuted, setIsMuted] = useState(false); // Estado de mi audio
    const [reconnectStatus, setReconnectStatus] = useState(null); // Para mostrar estado de reconexión

    // REFERENCIAS
    const localStreamRef = useRef(null); // Contiene el objeto MediaStream
    const peerRef = useRef(null); // Contiene la instancia de RTCPeerConnection
    const ringtoneRef = useRef(null); // Para manejar el audio de la llamada (requiere un módulo nativo para audio)

    // FUNCIÓN CLAVE: OBTENER MEDIOS
    const startLocalMedia = useCallback(async () => {
        try {
            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: videoEnabled, // Inicia con la configuración de video actual
            });
            
            localStreamRef.current = stream;
            setLocalStreamState(stream);
            console.log('✅ Medios locales obtenidos en RN.');
            return stream;
            
        } catch (err) {
            console.error('❌ Error al obtener medios locales en RN:', err);
            toast.error('No se pudo acceder a la cámara o micrófono.');
            // En caso de error, aseguramos que la llamada no continúe.
            setIsCalling(false);
            setIncomingCall(null);
            return null;
        }
    }, [videoEnabled]);

    // FUNCIÓN CLAVE: CREAR PEER CONNECTION
    const createPeerConnection = useCallback((stream, partnerId, isCaller) => {
        // Usamos la clase RTCPeerConnection importada de 'react-native-webrtc'
        const pc = new RTCPeerConnection(peerConfiguration);
        peerRef.current = pc;

        // Añadir las pistas locales
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        // 1. ICE CANDIDATES (Señalización)
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('webrtcSignal', {
                    toUserId: partnerId,
                    candidate: event.candidate,
                });
            }
        };

        // 2. REMOTE STREAM (Recepción de medios)
        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
                console.log('🎉 Stream Remoto recibido');
            }
        };

        // 3. CAMBIO DE ESTADO DE CONEXIÓN
        pc.onconnectionstatechange = () => {
            console.log(`📡 Estado de conexión: ${pc.connectionState}`);
            if (pc.connectionState === 'connected') {
                setIsInCall(true);
                setIsCalling(false);
                setIncomingCall(null);
                setReconnectStatus(null);
            } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                setReconnectStatus('Reconectando...');
                // Aquí podrías implementar la lógica de reconexión (restartIce)
            } else if (pc.connectionState === 'closed') {
                endCall();
            }
        };

        // 4. OFERTA DE SEÑALIZACIÓN (Solo si soy el que inicia la llamada)
        if (isCaller) {
            pc.onnegotiationneeded = async () => {
                try {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit('webrtcSignal', {
                        toUserId: partnerId,
                        sdp: pc.localDescription,
                    });
                } catch (e) {
                    console.error('Error al crear oferta:', e);
                }
            };
        }
        return pc;
    }, [socket]);

    // LÓGICA DE MANEJO DE LLAMADAS

    // Llamada Saliente
    const handleStartCall = useCallback(async ({ partnerId, partnerUsername, type = 'video' }) => {
        const stream = await startLocalMedia();
        if (!stream) return;

        const pc = createPeerConnection(stream, partnerId, true); // True = soy el que llama

        setCurrentCall({ partnerId, partnerUsername, type, isCaller: true });
        setIsCalling(true);

        // 💡 DISPARAR LA NAVEGACIÓN (Notifica al componente padre para navegar)
        if (onCallStart) {
            onCallStart();
        }
        
        // Señalización inicial
        socket.emit('callUser', {
            toUserId: partnerId,
            fromUserId: userProfile.id,
            username: userProfile.username,
            type: type,
        });

    }, [socket, userProfile.id, userProfile.username, startLocalMedia, createPeerConnection, onCallStart]);

    // Llamada Entrante
    const handleIncomingCall = useCallback((data) => {
        if (isInCall || isCalling) {
            socket.emit('busy', { toUserId: data.fromUserId });
            return;
        }

        setIncomingCall({
            partnerId: data.fromUserId,
            partnerUsername: data.username,
            type: data.type,
            socketId: data.socketId,
        });
        // 💡 Aquí se debería reproducir el tono de llamada (manejo nativo en RN)
        // ringtoneRef.current?.play();
    }, [isInCall, isCalling]);



    // 1. Inicialización del Ringtone
    const initializeRingtone = useCallback(async () => {
        // Limpiamos la instancia anterior si existe
        if (ringtoneRef.current) {
            ringtoneRef.current.stop();
            ringtoneRef.current.release();
            ringtoneRef.current = null;
        }

        // Obtiene la ruta del tono seleccionado (asset name o file URI)
        const tonePath = await getCurrentRingtonePath(); 

        // 💡 Determinamos si es un asset local (bundle) o una URI de archivo
        const isLocalAsset = !(tonePath.startsWith('http') || tonePath.startsWith('file://'));
        
        // El segundo argumento es el 'base path' (MAIN_BUNDLE para assets locales)
        const newSound = new Sound(tonePath, isLocalAsset ? Sound.MAIN_BUNDLE : null, (error) => {
            if (error) {
                console.error('Error al cargar el tono:', error.message);
                return;
            }
            // 💡 Configuramos propiedades nativas
            newSound.setVolume(1.0);
            newSound.setNumberOfLoops(-1); // Loop infinito
            // Esto ayuda a que el sonido se escuche en modo silencio (si lo permite la configuración del sistema)
            newSound.setCategory('Playback', true); 
        });

        ringtoneRef.current = newSound;

    }, []);

    // 2. Efecto para manejar la reproducción del tono
    useEffect(() => {
        // Vuelve a cargar el tono si la ruta ha cambiado (por ejemplo, después de una selección de usuario)
        initializeRingtone();
        
        return () => {
            if (ringtoneRef.current) {
                ringtoneRef.current.release(); // Libera el recurso cuando el hook se desmonta
            }
        };
    }, [initializeRingtone]);

    // 3. Efecto para reproducir/detener basado en `incomingCall`
    useEffect(() => {
        if (!ringtoneRef.current) return;

        if (incomingCall && !currentCall) {
            console.log("▶️ Reproduciendo tono de llamada...");
            // Usamos un pequeño delay si es necesario para dar tiempo a cargar el Sound
            setTimeout(() => {
                ringtoneRef.current.play(success => {
                    if (!success) {
                        console.error('Fallo en la reproducción del tono.');
                    }
                });
            }, 500); 
        } else {
            console.log("⏹️ Deteniendo tono de llamada...");
            ringtoneRef.current.stop();
        }
    }, [incomingCall, currentCall]); // Depende de si hay una llamada entrante o si ya estamos conectados

    // Aceptar Llamada Entrante
    const handleAcceptCall = useCallback(async (callDetails) => {
        // Detener tono de llamada (si aplica)
        // ringtoneRef.current?.pause();
        
        const stream = await startLocalMedia();
        if (!stream) return;

        const pc = createPeerConnection(stream, callDetails.partnerId, false); // False = no soy el que llama

        setCurrentCall({ ...callDetails, isCaller: false });
        setIncomingCall(null);
        setIsCalling(true);
        
        // 💡 DISPARAR LA NAVEGACIÓN
        if (onCallStart) {
            onCallStart();
        }
        
        // Señalización de aceptación: el Answer se crea cuando llega el SDP Offer
        socket.emit('acceptCall', { toUserId: callDetails.partnerId });
    }, [startLocalMedia, createPeerConnection, onCallStart]);

    // Terminar Llamada
    const endCall = useCallback(() => {
        if (peerRef.current) {
            peerRef.current.close();
        }
        
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Notificar al otro usuario
        if (currentCall?.partnerId) {
            socket.emit('callEnded', { toUserId: currentCall.partnerId });
        }
        if (ringtoneRef.current) {
            ringtoneRef.current.stop(); // 🛑 Detener el tono al finalizar/rechazar
        }
        // Limpiar estados
        setIsInCall(false);
        setIsCalling(false);
        setIncomingCall(null);
        setCurrentCall(null);
        setRemoteStream(null);
        setLocalStreamState(null);
        setReconnectStatus(null);
    }, [currentCall?.partnerId, socket]);


    // MANEJADORES DE CÁMARA Y AUDIO

    const toggleVideo = useCallback(() => {
        const newVideoEnabled = !videoEnabled;
        setVideoEnabled(newVideoEnabled);
        
        // Deshabilitar/Habilitar la pista de video
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = newVideoEnabled;
            }
        }
    }, [videoEnabled]);

    const toggleMute = useCallback(() => {
        const newIsMuted = !isMuted;
        setIsMuted(newIsMuted);

        // Deshabilitar/Habilitar la pista de audio
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !newIsMuted;
            }
        }
    }, [isMuted]);

    // EFECTO DE LISTENERS DE SOCKET.IO Y SEÑALIZACIÓN WEBRTC
    useEffect(() => {
        if (!socket) return;
        
        // Señalización WebRTC
        const handleWebRTCSignal = async ({ sdp, candidate, fromUserId }) => {
            const pc = peerRef.current;
            if (!pc) return;

            if (sdp) {
                try {
                    const rtcSdp = new RTCSessionDescription(sdp);
                    await pc.setRemoteDescription(rtcSdp);
                    console.log(`➡️ SDP ${sdp.type} recibido`);
                    
                    if (sdp.type === 'offer' && !currentCall?.isCaller) {
                        // Si recibo una Oferta y no soy el que llama, creo la Respuesta (Answer)
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        socket.emit('webrtcSignal', {
                            toUserId: fromUserId,
                            sdp: pc.localDescription,
                        });
                    }
                } catch (e) {
                    console.error('Error al manejar SDP:', e);
                }
            } else if (candidate) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log('➡️ ICE Candidate recibido');
                } catch (e) {
                    console.error('Error al agregar ICE Candidate:', e);
                }
            }
        };

        socket.on('incomingCall', handleIncomingCall);
        socket.on('webrtcSignal', handleWebRTCSignal);
        socket.on('callEnded', endCall);
        socket.on('busy', () => toast.error('El usuario está ocupado.'));

        return () => {
            socket.off('incomingCall', handleIncomingCall);
            socket.off('webrtcSignal', handleWebRTCSignal);
            socket.off('callEnded', endCall);
            socket.off('busy', () => toast.error('El usuario está ocupado.'));
        };
    }, [socket, handleIncomingCall, endCall, currentCall?.isCaller]);

    // EFECTO DE GESTIÓN DE SEGUNDO PLANO (BACKGROUNDING) - APPSTATE
    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (!isInCall || !localStreamRef.current) return;

            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (!videoTrack) return;
            
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                console.log("🌙 App en segundo plano: Desactivando video...");
                // Deshabilitar video (mantener audio para llamadas de solo voz)
                videoTrack.enabled = false;
            } else if (nextAppState === 'active') {
                console.log("☀️ App activa: Reactivando video...");
                // Reactivar video (solo si el usuario no lo había deshabilitado manualmente)
                if (videoEnabled) {
                    videoTrack.enabled = true;
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [isInCall, videoEnabled]);
    


    
    // El resto de tu lógica de Heartbeat y desconexión de Socket.IO se mantiene
    // ...

    return {
        isCalling,
        isInCall,
        setIsInCall, // Puede ser útil para forzar el cierre
        incomingCall,
        currentCall,
        setCurrentCall,
        remoteStream,
        videoEnabled,
        localStreamState,
        reconnectStatus,
        isMuted,
        toggleMute,
        toggleVideo,
        handleStartCall,
        handleAcceptCall,
        endCall,
        // ... (otros retornos si son necesarios)
    };
};

export default useWebRTC;