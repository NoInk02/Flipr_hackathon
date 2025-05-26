'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
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

export default function ClientSignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const companyid = params.companyid as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
        type: 'client',
        company_id: companyid,
      });
      setIsLoading(false);

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result?.ok) {
        toast.success('Successfully signed in!');
        setTimeout(() => {
          router.push(`/company/${companyid}/client/${username}`);
        }, 100);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
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
              Client Sign In
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
                id="username"
                label="Client ID"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  'Sign In'
                )}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <MuiLink
                  component={Link}
                  href={`/company/${companyid}/clientregister`}
                  variant="body2"
                  sx={{ color: 'secondary.main' }}
                >
                  {"Don't have an account? Sign Up"}
                </MuiLink>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}