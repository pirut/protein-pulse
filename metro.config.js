const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for more file extensions
config.resolver.sourceExts.push('cjs');

module.exports = config; 