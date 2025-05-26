'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Box, Typography, Container, Link as MuiLink, Alert, Card, CardContent } from '@mui/material';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password, 
          email,
          company_list: []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 422) {
          // Handle validation errors
          const validationErrors = errorData.detail;
          if (Array.isArray(validationErrors)) {
            setError(validationErrors.map(err => err.msg).join(', '));
          } else {
            setError(errorData.detail || 'Validation error occurred');
          }
        } else {
          setError(errorData.detail || 'Registration failed');
        }
        return;
      }

      toast.success('Successfully registered! Please sign in.');
      router.push('/signin');
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration. Please try again.');
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
            mt: { xs: 4, sm: 0 },position: 'relative', 
            zIndex: 1
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              component="h1"
              variant="h5"
              sx={{ textAlign: 'center', mb: 3, fontWeight: 600, color: 'primary.main' }}
            >
              Register
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
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
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
              >
                Register
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <MuiLink href="/signin" component={Link} variant="body2" sx={{ color: 'secondary.main' }}>
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