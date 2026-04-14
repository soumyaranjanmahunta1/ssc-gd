/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Silence all warning popups (YellowBox/LogBox)
LogBox.ignoreAllLogs();

AppRegistry.registerComponent(appName, () => App);
