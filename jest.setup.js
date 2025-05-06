// Import testing-library utilities
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  },
  onAuthStateChange: jest.fn((callback) => {
    // Default implementation to simulate no logged in user
    callback(null);
    return jest.fn(); // Return a mock unsubscribe function
  }),
  logoutUser: jest.fn(),
}));

// Mock Resend API for email testing
jest.mock('@/services/email', () => ({
  sendInvoiceEmail: jest.fn().mockResolvedValue({ success: true }),
}));

// Mock console methods to suppress output during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Set up global test environment
global.fetch = jest.fn();
