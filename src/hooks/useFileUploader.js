// src/hooks/useFileUploader.js (Reemplazo de useFilePicker.js)

import { useCallback } from 'react';
import DocumentPicker from 'react-native-document-picker';
import { supabase } from '../services/supabaseClient'; // Tu cliente configurado
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

// 💡 Función de utilidad crucial para React Native:
// Convierte el URI local del archivo (dado por el picker) en un Blob,
// que es lo que la librería de Supabase Storage necesita para subir el archivo.
const getBlobFromUri = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            resolve(xhr.response);
        };
        xhr.onerror = function (e) {
            console.error("Error al convertir URI a Blob:", e);
            reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
    });
    return blob;
};

// ------------------------------------------------------------------

const useFileUploader = ({ socket, userProfile, activeChat }) => {
    
    // 1. Función para abrir el selector de archivos nativo
    const pickFile = useCallback(async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
                copyTo: 'cachesDirectory', // Copia el archivo temporalmente
            });
            
            // El resultado es un array; tomamos el primer archivo
            const file = res[0]; 
            return {
                uri: file.uri,
                name: file.name,
                type: file.type, // MIME type
                size: file.size,
            };
            
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log('Selección de archivo cancelada.');
            } else {
                console.error('Error al seleccionar archivo:', err);
                toast.error('Error al abrir el selector de archivos.');
            }
            return null;
        }
    }, []);

    // 2. Función para subir a Supabase Storage y enviar mensaje
    const uploadFileAndSendMessage = useCallback(async (file) => {
        if (!file || !userProfile || !activeChat || !socket) {
            toast.error('Faltan datos para enviar el archivo.');
            return;
        }

        const chatId = activeChat.chat_id;
        
        try {
            // A. Convertir URI a Blob
            const fileBlob = await getBlobFromUri(file.uri);
            
            // B. Generar ruta única en Supabase
            const fileExtension = file.name.split('.').pop();
            const uniqueFileName = `${uuidv4()}.${fileExtension}`;
            const filePath = `chat_files/${chatId}/${uniqueFileName}`;
            
            toast.loading('Subiendo archivo...', { id: 'file-upload' });

            // C. Subir el Blob a Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('chat_files') // Reemplaza 'chat_files' con el nombre de tu bucket
                .upload(filePath, fileBlob, { 
                    contentType: file.type,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // D. Obtener la URL pública
            const { data: publicUrlData } = supabase.storage
                .from('chat_files')
                .getPublicUrl(filePath);
            
            const fileUrl = publicUrlData.publicUrl;

            // E. Crear el mensaje en la base de datos
            const { data: message, error: insertError } = await supabase
                .from('messages')
                .insert({
                    chat_id: chatId,
                    sender_id: userProfile.id,
                    content: 'Archivo adjunto', // O el nombre del archivo si lo deseas
                    type: 'file', // Nuevo tipo de mensaje
                    file_url: fileUrl,
                    file_name: file.name,
                    file_mime_type: file.type,
                    file_size: file.size,
                })
                .select()
                .single();

            if (insertError) throw insertError;
            
            // F. Emitir el mensaje a través de Socket.IO
            socket.emit('sendMessage', {
                chatId: chatId,
                message: { 
                    ...message, 
                    sender_id: userProfile.id,
                    sender_username: userProfile.username,
                },
                receiverId: activeChat.id, 
            });

            toast.success('Archivo enviado correctamente', { id: 'file-upload' });

        } catch (error) {
            console.error('Error en la subida y envío:', error);
            toast.error('Fallo al subir o enviar archivo.', { id: 'file-upload' });
        }
    }, [userProfile, activeChat, socket]);

    return {
        pickFile,
        uploadFileAndSendMessage,
    };
};

export default useFileUploader;