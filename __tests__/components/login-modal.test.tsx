import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginModal } from '@/components/login-modal';
import * as firebase from '@/lib/firebase';

// Mock the firebase module
jest.mock('@/lib/firebase', () => ({
  auth: {
    signInWithEmailAndPassword: jest.fn(),
  },
}));

describe('LoginModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnLogin = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the login form when open', () => {
    render(<LoginModal isOpen={true} onClose={mockOnClose} onLogin={mockOnLogin} />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
  
  it('does not render when isOpen is false', () => {
    render(<LoginModal isOpen={false} onClose={mockOnClose} onLogin={mockOnLogin} />);
    
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });
  
  it('calls firebase signInWithEmailAndPassword when form is submitted', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ user: { email: 'test@example.com' } });
    (firebase.auth.signInWithEmailAndPassword as jest.Mock).mockImplementation(mockSignIn);
    
    render(<LoginModal isOpen={true} onClose={mockOnClose} onLogin={mockOnLogin} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockOnLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
  
  it('shows error message when login fails', async () => {
    const mockError = new Error('Invalid login credentials');
    (firebase.auth.signInWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError);
    
    render(<LoginModal isOpen={true} onClose={mockOnClose} onLogin={mockOnLogin} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
