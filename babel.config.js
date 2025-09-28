export default function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
// babel.config.js (Código Final)

export default function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Asegúrate de que este plugin exista en tu package.json
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env', // Ruta de tu archivo de variables
          safe: false,
          allowUndefined: true,
        },
      ],
      // Necesario si usas Expo Router:
      'expo-router/babel', 
    ],
  };
};