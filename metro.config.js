/**
 * Use Expo's default Metro config, so WebStorm and other tools can find it.
 */
const { getDefaultConfig } = require('@expo/metro-config');
module.exports = getDefaultConfig(__dirname);