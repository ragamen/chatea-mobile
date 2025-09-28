// CÓDIGO MIGRADO EN src/hooks/useFilePicker.js
import * as DocumentPicker from 'expo-document-picker';
import { useCallback } from 'react';

const useFilePicker = () => {
  const pickFile = useCallback(async () => {
    try {
      // Usar la función principal del nuevo módulo de Expo
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Esto permite seleccionar cualquier tipo de archivo
        copyToCacheDirectory: true, // Recomendado para asegurar acceso al archivo
      });

      // La estructura de la respuesta ha cambiado
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        // Devuelve el primer archivo del array de assets
        const file = result.assets[0];

        // NOTA: Para subir el archivo a tu backend (como lo haces en handleConfirmSendFile)
        // en React Native, la 'uri' del archivo local funciona como su ruta.
        // Si necesitas un objeto 'File' estándar de JavaScript, deberás adaptarlo
        // en la función que lo consume (handleFileUpload/handleConfirmSendFile).
        
        // Lo más sencillo es devolver los datos que necesites:
        return {
          name: file.name,
          uri: file.uri, // La ruta local del archivo
          mimeType: file.mimeType,
          size: file.size,
        };
      }
      return null;
    } catch (error) {
      console.error("Error al seleccionar documento:", error);
      throw new Error("Fallo al seleccionar el archivo.");
    }
  }, []);

  // Para compatibilidad con el código web que tienes en el snippet (createElement('input')), 
  // podrías añadir una bifurcación: 
  // if (Platform.OS === 'web') { /* Tu lógica web anterior */ } else { /* Lógica de Expo */ }

  return pickFile;
};

export default useFilePicker;