// src/services/ringtoneService.js

import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔔 NOTA: Estos archivos deben existir en los assets nativos de tu app
export const DEFAULT_RINGTONES = [
    { id: 'classic', name: 'Ringtone Clásico', path: 'ringtone_classic.mp3' },
    { id: 'modern', name: 'Modern Echo', path: 'modern_echo.mp3' },
    { id: 'gentle', name: 'Gentle Bell', path: 'gentle_bell.mp3' },
];

const CUSTOM_RINGTONE_KEY = 'customRingtonePath';

/**
 * Obtiene la ruta del tono de llamada actualmente seleccionado.
 * @returns {string} La ruta del archivo de audio (asset name o file URI).
 */
export const getCurrentRingtonePath = async () => {
    try {
        const selectedIdOrPath = await AsyncStorage.getItem(CUSTOM_RINGTONE_KEY);

        if (selectedIdOrPath) {
            // Si es uno de los IDs por defecto
            const defaultTone = DEFAULT_RINGTONES.find(t => t.id === selectedIdOrPath);
            if (defaultTone) return defaultTone.path;
            
            // Si es una URI de archivo personalizada
            if (selectedIdOrPath.startsWith('file://')) return selectedIdOrPath;
        }
    } catch (e) {
        console.error('Error leyendo el tono personalizado:', e);
    }
    // Retorna la ruta del primer tono por defecto
    return DEFAULT_RINGTONES[0].path; 
};

/**
 * Guarda la ruta (URI) o el ID del tono seleccionado.
 * @param {string} pathOrId - El ID del tono por defecto o el URI del archivo.
 */
export const saveRingtone = async (pathOrId) => {
    try {
        await AsyncStorage.setItem(CUSTOM_RINGTONE_KEY, pathOrId);
        return true;
    } catch (e) {
        console.error('Error guardando el tono personalizado:', e);
        return false;
    }
};