// CÓDIGO MIGRADO EN src/hooks/useFilePicker.js
import DocumentPicker, { types } from 'react-native-document-picker';

const useFilePicker = () => {
  const pickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [types.images, types.video, types.audio, types.pdf, types.doc],
      });
      
      // La librería devuelve un array de resultados, tomamos el primero
      const file = result[0];
      
      // DEBES agregar la lógica para leer el archivo como Blob/File
      // y adjuntarlo a tu objeto de mensaje, similar a como lo hacías antes.
      return file; 
      
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Selección de archivo cancelada');
        return null; 
      } else {
        throw err;
      }
    }
  }, []);
  return { pickFile };
};