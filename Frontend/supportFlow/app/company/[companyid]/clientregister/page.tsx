'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Link as MuiLink,
  Alert,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ClientRegister() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const companyid = params.companyid as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Client-side validations
    if (name.length < 2) {
      setError('Name must be at least 2 characters long');
      setIsLoading(false);
      return;
    }
    if (username.length < 3) {
      setError('Client ID must be at least 3 characters long');
      setIsLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Server-side validation
    try {
      const response = await fetch(`http://localhost:8000/${companyid}/clients/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientID: username,
          password: password,
          ticketIDs: []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : 'Registration failed on the server.';
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      toast.success('Successfully registered! Please sign in.');
      router.push(`/company/${companyid}/clientlogin`);
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e6f0ff 0%, #f0f4ff 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(0, 82, 204, 0.1) 10%, transparent 40%)',
          transform: 'rotate(30deg)',
        },
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            maxWidth: 400,
            mx: 'auto',
            mt: { xs: 4, sm: 0 },
            position: 'relative',
            zIndex: 1,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              component="h1"
              variant="h5"
              sx={{ textAlign: 'center', mb: 3, fontWeight: 600, color: 'primary.main' }}
            >
              Client Register
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 2 }}
                disabled={isLoading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Client ID"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
                disabled={isLoading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                disabled={isLoading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                disabled={isLoading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirm-password"
                label="Confirm Password"
                type="password"
                id="confirm-password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 3 }}
                disabled={isLoading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #0052cc 30%, #4d8cff 90%)',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0, 82, 204, 0.3)' },
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white', position: 'absolute' }} />
                ) : (
                  'Register'
                )}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <MuiLink
                  component={Link}
                  href={`/company/${companyid}/clientlogin`}
                  variant="body2"
                  sx={{ color: 'secondary.main' }}
                >
                  {'Already have an account? Sign In'}
                </MuiLink>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}