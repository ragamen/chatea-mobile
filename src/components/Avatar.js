// CÓDIGO MIGRADO EN src/components/Avatar.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const Avatar = ({ username, avatarUrl, size = 'sm' }) => {
  const sizeStyles = {
    sm: { width: 32, height: 32, fontSize: 12 },
    md: { width: 40, height: 40, fontSize: 16 },
    lg: { width: 48, height: 48, fontSize: 18 },
  };
  
  const currentSize = sizeStyles[size];

  return avatarUrl ? (
    <Image 
      source={{ uri: avatarUrl }} 
      style={[styles.avatarImage, currentSize]} 
      resizeMode="cover"
    />
  ) : (
    <View style={[styles.avatarPlaceholder, currentSize]}>
      <Text style={styles.placeholderText}>
        {username?.charAt(0)?.toUpperCase() || '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarImage: {
    borderRadius: 9999, // Simula rounded-full
  },
  avatarPlaceholder: {
    borderRadius: 9999,
    backgroundColor: '#3B82F6', // blue-500
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Avatar;