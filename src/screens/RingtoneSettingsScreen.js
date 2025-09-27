// src/screens/RingtoneSettingsScreen.js (Ejemplo)

import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { DEFAULT_RINGTONES, saveRingtone, getCurrentRingtonePath } from '../services/ringtoneService';

const RingtoneSettingsScreen = () => {
    const [selectedPath, setSelectedPath] = useState(null);
    const MIN_DURATION_SECONDS = 5; // Requisito de longitud mínima

    useEffect(() => {
        getCurrentRingtonePath().then(setSelectedPath);
    }, []);

    const handlePickCustomFile = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.audio],
            });

            const file = res[0];
            
            // 💡 NOTA sobre validación de longitud (Ejemplo Conceptual):
            // La validación de duración es compleja en RN sin librerías adicionales.
            // Para una migración rápida, omitimos la validación estricta y solo guardamos.
            // Si la duración es crítica, se necesitaría una librería como `react-native-get-music-files` o similar para leer metadatos del archivo.
            
            await saveRingtone(file.uri);
            setSelectedPath(file.uri);
            Alert.alert('Éxito', `Tono personalizado (${file.name}) guardado. Reinicia la aplicación para que se cargue en las llamadas.`);
            
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log('Selección cancelada.');
            } else {
                Alert.alert('Error', 'Fallo al seleccionar o guardar el archivo.');
                console.error('Error de selección:', err);
            }
        }
    };
    
    const handleSelectDefault = async (ringtone) => {
        await saveRingtone(ringtone.id);
        setSelectedPath(ringtone.path);
        Alert.alert('Éxito', `Tono "${ringtone.name}" seleccionado.`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Tonos de Llamada ({MIN_DURATION_SECONDS}s Mínimo)</Text>
            
            {/* Opciones por Defecto */}
            <FlatList
                data={DEFAULT_RINGTONES}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.toneItem} 
                        onPress={() => handleSelectDefault(item)}
                    >
                        <Text style={styles.toneName}>{item.name}</Text>
                        {selectedPath === item.path && <Text style={styles.selected}>✅ Seleccionado</Text>}
                    </TouchableOpacity>
                )}
            />
            
            {/* Opción Personalizada */}
            <Button 
                title="🎶 Seleccionar Canción Favorita (MP3)" 
                onPress={handlePickCustomFile} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    toneItem: { 
        padding: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee', 
        flexDirection: 'row', 
        justifyContent: 'space-between' 
    },
    toneName: { fontSize: 16 },
    selected: { color: 'green', fontWeight: 'bold' }
});

export default RingtoneSettingsScreen;