// Jest setup file
import 'react-native-gesture-handler/jestSetup';

// Mock react-native-ble-plx
jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn(() => ({
    state: jest.fn(),
    onStateChange: jest.fn(),
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
    connectToDevice: jest.fn(),
    cancelDeviceConnection: jest.fn(),
  })),
  State: {
    PoweredOn: 'PoweredOn',
    PoweredOff: 'PoweredOff',
  },
}));

// Mock Google Sign-In
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ user: {} })),
    signOut: jest.fn(() => Promise.resolve()),
    isSignedIn: jest.fn(() => Promise.resolve(false)),
  },
}));

// Mock Calendar Events
jest.mock('react-native-calendar-events', () => ({
  requestPermissions: jest.fn(() => Promise.resolve('authorized')),
  findCalendars: jest.fn(() => Promise.resolve([])),
  fetchAllEvents: jest.fn(() => Promise.resolve([])),
}));

// Mock Permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      BLUETOOTH_PERIPHERAL: 'ios.permission.BLUETOOTH_PERIPHERAL',
      CALENDARS: 'ios.permission.CALENDARS',
    },
    ANDROID: {
      BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
      BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
      READ_CALENDAR: 'android.permission.READ_CALENDAR',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  request: jest.fn(() => Promise.resolve('granted')),
  check: jest.fn(() => Promise.resolve('granted')),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
