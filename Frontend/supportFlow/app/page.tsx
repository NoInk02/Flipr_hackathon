'use client';

import { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Card, CardContent, Fade } from '@mui/material';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [showHero, setShowHero] = useState(false);

  // Trigger hero animation on mount
  useEffect(() => {
    setShowHero(true);
  }, []);

  // Testimonial data
  const testimonials = [
    {
      name: 'Jane Doe, TechCorp',
      text: 'This platform transformed our support process. Fast, reliable, and intuitive!',
    },
    {
      name: 'John Smith, GrowEasy',
      text: 'The ticketing system is seamless, and our customers love the quick responses.',
    },
    {
      name: 'Emily Chen, StartUp Inc.',
      text: 'A game-changer for our team. The UI is clean and professional.',
    },
    {
      name: 'Michael Lee, Innovate Ltd.',
      text: 'Support has never been easier. Highly recommend this platform!',
    },
  ];

  // Duplicate testimonials for seamless infinite scrolling
  const doubledTestimonials = [...testimonials, ...testimonials];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              SupportFlow
            </Link>
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="primary" href="/company">
              Companies
            </Button>
            <Button color="primary" href="/signin">
              Sign In
            </Button>
            <Button variant="contained" color="primary" href="/register">
              Register
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section (Get Started) */}
      <Container sx={{ py: 20, textAlign: 'center' }}>
        <Fade in={showHero} timeout={1000}>
          <Box>
            <Typography variant="h1" sx={{ mb: 2, color: 'primary.main' }}>
              Welcome to SupportFlow
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
              Streamline your customer support with our powerful, easy-to-use platform.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              href="/register"
              sx={{ px: 4, py: 1.5 }}
            >
              Get Started
            </Button>
          </Box>
        </Fade>
      </Container>

      {/* Scrolling Testimonials Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container>
          <Typography variant="h2" sx={{ mb: 4, textAlign: 'center' }}>
            What Our Customers Say
          </Typography>
          <Box sx={{ overflow: 'hidden', position: 'relative' }}>
            <motion.div
              style={{
                display: 'flex',
                gap: '16px',
                width: 'max-content',
              }}
              animate={{
                x: ['0%', '-50%'],
                transition: {
                  x: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: 20, // Adjust speed of scrolling
                    ease: 'linear',
                  },
                },
              }}
            >
              {doubledTestimonials.map((review, index) => (
                <Card
                  key={index}
                  sx={{
                    minWidth: 300,
                    maxWidth: 300,
                    m: 1,
                    boxShadow: 3,
                    flexShrink: 0,
                  }}
                >
                  <CardContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      "{review.text}"
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      — {review.name}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}