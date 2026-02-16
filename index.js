/**
 * Even G2 Calendar Companion
 * React Native Entry Point
 * 
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register the main application component
AppRegistry.registerComponent(appName, () => App);
