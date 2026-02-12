/**
 * Even G2 Calendar Companion
 * Main App Component
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { appCoordinator } from './src/services/AppCoordinator';
import { bleManager } from './src/services/ble/BLEManager';
import { calendarService } from './src/services/calendar/CalendarService';
import { G2DeviceInfo, BLEConnectionState } from './src/types/ble.types';
import { NextEventInfo } from './src/types/calendar.types';

function App(): React.JSX.Element {
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<G2DeviceInfo[]>([]);
  const [connectionState, setConnectionState] = useState<BLEConnectionState>(
    BLEConnectionState.DISCONNECTED
  );
  const [nextEvent, setNextEvent] = useState<NextEventInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize app
  useEffect(() => {
    initializeApp();
    return () => {
      appCoordinator.destroy();
    };
  }, []);

  const initializeApp = async () => {
    try {
      await appCoordinator.initialize();
      setIsInitialized(true);

      // Setup listeners
      bleManager.onConnectionStateChange(state => {
        setConnectionState(state);
      });

      bleManager.onDeviceDiscovered(device => {
        setDevices(prev => {
          const exists = prev.find(d => d.id === device.id);
          if (exists) return prev;
          return [...prev, device];
        });
      });

      bleManager.onError(error => {
        setError(error.message);
        Alert.alert('BLE Error', error.message);
      });

      calendarService.onNextEventChange(event => {
        setNextEvent(event);
      });

      calendarService.onError(error => {
        setError(error.message);
        Alert.alert('Calendar Error', error.message);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Initialization failed';
      setError(message);
      Alert.alert('Initialization Error', message);
    }
  };

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setDevices([]);
      await appCoordinator.scanForDevices();
      setTimeout(() => {
        setIsScanning(false);
      }, 10000);
    } catch (error) {
      setIsScanning(false);
      const message = error instanceof Error ? error.message : 'Scan failed';
      Alert.alert('Scan Error', message);
    }
  };

  const handleConnect = async (deviceId: string) => {
    try {
      await appCoordinator.connectToDevice(deviceId);
      Alert.alert('Success', 'Connected to G2 glasses');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      Alert.alert('Connection Error', message);
    }
  };

  const handleDisconnect = async () => {
    try {
      await appCoordinator.disconnect();
      Alert.alert('Disconnected', 'Disconnected from G2 glasses');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Disconnect failed';
      Alert.alert('Error', message);
    }
  };

  const handleSyncCalendar = async () => {
    try {
      await appCoordinator.syncCalendars();
      Alert.alert('Success', 'Calendar synced successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      Alert.alert('Sync Error', message);
    }
  };

  const renderDevice = ({ item }: { item: G2DeviceInfo }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => handleConnect(item.id)}
      disabled={connectionState === BLEConnectionState.CONNECTING}
    >
      <View>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceId}>ID: {item.id}</Text>
        <Text style={styles.deviceRssi}>Signal: {item.rssi} dBm</Text>
      </View>
      {item.isConnected && (
        <View style={styles.connectedBadge}>
          <Text style={styles.connectedText}>Connected</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Even G2 Calendar</Text>
        <Text style={styles.subtitle}>
          {connectionState === BLEConnectionState.CONNECTED
            ? '🟢 Connected'
            : '🔴 Disconnected'}
        </Text>
      </View>

      {/* Next Event Display */}
      {nextEvent && (
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>{nextEvent.displayText.title}</Text>
          <Text style={styles.eventTime}>{nextEvent.displayText.timeRange}</Text>
          {nextEvent.displayText.location && (
            <Text style={styles.eventLocation}>
              📍 {nextEvent.displayText.location}
            </Text>
          )}
          <Text style={styles.eventTimeUntil}>
            {nextEvent.displayText.timeUntil}
          </Text>
          <Text style={styles.eventDuration}>
            Duration: {nextEvent.displayText.duration}
          </Text>
        </View>
      )}

      {!nextEvent && (
        <View style={styles.noEventCard}>
          <Text style={styles.noEventText}>No upcoming events</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {connectionState === BLEConnectionState.DISCONNECTED && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleScan}
            disabled={isScanning}
          >
            <Text style={styles.buttonText}>
              {isScanning ? 'Scanning...' : 'Scan for G2'}
            </Text>
          </TouchableOpacity>
        )}

        {connectionState === BLEConnectionState.CONNECTED && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleDisconnect}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSyncCalendar}
            >
              <Text style={styles.buttonText}>Sync Calendar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Device List */}
      {isScanning || devices.length > 0 ? (
        <View style={styles.deviceList}>
          <Text style={styles.sectionTitle}>Available Devices</Text>
          {isScanning && (
            <ActivityIndicator size="small" color="#007AFF" style={styles.scanningIndicator} />
          )}
          <FlatList
            data={devices}
            renderItem={renderDevice}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              !isScanning ? (
                <Text style={styles.emptyText}>No devices found</Text>
              ) : null
            }
          />
        </View>
      ) : null}

      {/* Error Display */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.errorDismiss}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  eventCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  eventTimeUntil: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 4,
  },
  eventDuration: {
    fontSize: 14,
    color: '#666',
  },
  noEventCard: {
    margin: 16,
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  noEventText: {
    fontSize: 16,
    color: '#999',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  scanningIndicator: {
    marginBottom: 12,
  },
  deviceItem: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  deviceId: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  connectedBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  connectedText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  errorBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFF',
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 16,
  },
});

export default App;
