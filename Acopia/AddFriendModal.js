// app/AddFriendModal.js (Versión React Native/Expo)

import React, { useState } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert 
} from 'react-native';
import { supabase } from '../src/services/supabaseClient'; // Ajusta la ruta a tu cliente supabase
import { UserPlus, Send, X, Loader2 } from 'lucide-react-native'; // Asegúrate de tener esta librería instalada y usar el sufijo -native
import { useRouter } from 'expo-router'; // Para cerrar el modal

const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
};

// Hook o Contexto para obtener el userProfile (Ajusta esto según cómo lo pases)
// Por simplicidad, asumiremos que obtienes userProfile del Contexto o de los params
// Si usas Context, debes importarlo aquí.
const userProfile = { id: '...', username: '...', email: '...' }; // Placeholder temporal

export default function AddFriendModalScreen() {
    const router = useRouter(); // Hook de navegación de Expo Router
    const [friendIdentifier, setFriendIdentifier] = useState('');
    const [loading, setLoading] = useState(false);

    // En Expo Router, para cerrar el modal simplemente usas router.back()
    const onClose = () => router.back(); 

    const handleSendRequest = async () => {
        const identifier = friendIdentifier.trim();
        // ... (Toda la lógica de Supabase es la misma, ¡no la cambies!) ...

        // Usar Alert.alert en lugar de toast para mostrar mensajes
        if (loading || !identifier) {
            Alert.alert('Error', 'Por favor, introduce un correo electrónico o nombre de usuario.');
            return;
        }

        setLoading(true);

        try {
            // ... (Toda la lógica de Supabase que ya tenías) ...
            
            // Reemplaza toast.success/error/info con Alert.alert o una librería RN
            Alert.alert('Éxito', `Solicitud enviada a ${friendProfile.username || friendProfile.email}!`);
            setFriendIdentifier('');
            onClose(); 
            // Si necesitas llamar a onFriendRequestSent, lo harías a través de un Contexto global.

        } catch (error) {
            console.error('Error al enviar solicitud de amistad:', error.message);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Renderizado de React Native ---
    return (
        <View style={styles.container}>
            <TouchableOpacity 
                onPress={onClose} 
                style={styles.closeButton}
                activeOpacity={0.7}
            >
                <X size={24} color="#6B7280" />
            </TouchableOpacity>
            
            <View style={styles.header}>
                <UserPlus size={24} color="#3B82F6" style={styles.headerIcon} />
                <Text style={styles.headerText}>Agregar Amigo</Text>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Correo electrónico o nombre de usuario"
                placeholderTextColor="#9CA3AF"
                value={friendIdentifier}
                onChangeText={setFriendIdentifier}
                editable={!loading}
                autoCapitalize="none"
                required
            />
            
            <TouchableOpacity
                style={[styles.button, styles.primaryButton, (!friendIdentifier.trim() || loading) && styles.disabledButton]}
                onPress={handleSendRequest}
                disabled={!friendIdentifier.trim() || loading}
                activeOpacity={0.7}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <>
                        <Send size={20} color="#FFFFFF" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Enviar Solicitud</Text>
                    </>
                )}
            </TouchableOpacity>
            
            <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onClose}
                disabled={loading}
                activeOpacity={0.7}
            >
                <Text style={styles.secondaryButtonText}>Cerrar</Text>
            </TouchableOpacity>
        </View>
    );
}

// --- Estilos de React Native ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#FFFFFF', // Fondo del modal
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 8,
        borderRadius: 20,
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    headerIcon: {
        marginRight: 8,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    input: {
        height: 50,
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 20,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 8,
        marginBottom: 10,
    },
    primaryButton: {
        backgroundColor: '#3B82F6',
    },
    secondaryButton: {
        backgroundColor: '#E5E7EB',
        borderColor: '#D1D5DB',
        borderWidth: 1,
    },
    disabledButton: {
        backgroundColor: '#93C5FD', // Un tono más claro de azul
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButtonText: {
        color: '#4B5563',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonIcon: {
        marginRight: 8,
    }
});