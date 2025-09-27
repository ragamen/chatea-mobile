// src/components/MessageInput.js

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Send, Camera, Paperclip, Mic } from 'lucide-react-native';

const MessageInput = ({ onSend, onCameraPress, onFilePress }) => {
  const [text, setText] = useState('');
  
  const handleSend = async () => {
    if (!text.trim() && !pendingFile) return;

    // Aquí llamaríamos al onSend del ChatDetailScreen
    // Asumimos que onSend maneja la lógica de subir el archivo si existe
    await onSend({ text: text.trim(), file: null }); // Simplificamos por ahora sin archivo pendiente
    
    setText('');
    // Lógica para limpiar el archivo pendiente (si se implementa)
  };

  const handleFilePicker = async () => {
    try {
      const file = await onFilePress(); // Llama al pickFile del hook
      if (file) {
        // 💡 NOTA: En RN, la vista previa de archivo es compleja. 
        // Idealmente, aquí navegarías a una FilePreviewScreen (modal nativo)
        // para que el usuario añada texto y confirme, y luego envías el archivo.
        
        // Por ahora, solo enviamos un mensaje de confirmación
        await onSend({ text: `[Archivo: ${file.name}]`, file });
      }
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
      // toast.error('Error al seleccionar archivo.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Botones de Archivo y Cámara */}
      <TouchableOpacity onPress={handleFilePicker} style={styles.iconButton}>
        <Paperclip color="#6B7280" size={24} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onCameraPress} style={styles.iconButton}>
        <Camera color="#6B7280" size={24} />
      </TouchableOpacity>

      {/* Campo de Texto */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Escribe un mensaje..."
          multiline={true}
        />
      </View>
      
      {/* Botón de Enviar (o Micrófono si no hay texto) */}
      <TouchableOpacity 
        onPress={handleSend} 
        style={[styles.iconButton, styles.sendButton, text.length > 0 ? styles.active : {}]}
        disabled={text.length === 0}
      >
        {text.length > 0 ? (
          <Send color="white" size={20} />
        ) : (
          <Mic color="#6B7280" size={24} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'flex-end', // Alinea los botones con el input multilínea
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  iconButton: {
    padding: 8,
    alignSelf: 'flex-end', // Alinea con la parte inferior del input
  },
  inputWrapper: {
    flex: 1,
    maxHeight: 120, // Limita el crecimiento del input multilínea
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 8,
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 16,
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: {
    backgroundColor: '#3B82F6', // Color azul para el botón de enviar activo
  }
});

export default MessageInput;