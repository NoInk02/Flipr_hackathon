'use client';
//Add feature to redirect to the previous page if the user is not authorized to access the page

import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography component="h1" variant="h2" color="primary.main">
          404 - Page Not Found
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, mb: 4, color: 'text.secondary' }}>
          Sorry, the page you are looking for does not exist.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          href="/"
          sx={{ px: 4, py: 1.5 }}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}