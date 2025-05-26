'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Collapse,
  Skeleton,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

interface Company {
  companyID: string;
  name: string;
  description: string;
}

export default function CompanyList() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/company/get_all');
        if (!response.ok) throw new Error('Failed to fetch companies');
        const data = await response.json();
        setCompanies(data);
        setFilteredCompanies(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const filtered = companies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) 
        // || company.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  const handleExpandClick = (companyID: string) => {
    setExpanded(expanded === companyID ? null : companyID);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
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
    }}>
      {/* Header */}
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            SupportFlow
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="primary" href="/">
              Home
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

      {/* Search Bar */}
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <TextField
          label="Search Companies"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            width: '50%',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }
          }}
        />
      </Box>

      {/* Company List */}
      <Box sx={{ 
        p: 4, 
        display: 'grid', 
        gap: 3,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(280px, 400px))',
          md: 'repeat(3, minmax(280px, 400px))',
          lg: 'repeat(4, minmax(280px, 400px))',
        },
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {loading ? (
          // Loading skeletons
          Array.from(new Array(6)).map((_, index) => (
            <Card 
              key={index}
              sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                height: 280,
                width: '100%',
                minWidth: 280,
                maxWidth: 400,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Skeleton 
                  variant="text" 
                  width="60%" 
                  height={32} 
                  sx={{ mb: 1 }}
                />
                <Skeleton 
                  variant="text" 
                  width="40%" 
                  height={24} 
                  sx={{ mb: 2 }}
                />
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  height={100} 
                  sx={{ borderRadius: 1, flex: 1 }}
                />
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Skeleton 
                  variant="rectangular" 
                  width="45%" 
                  height={36} 
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton 
                  variant="rectangular" 
                  width="45%" 
                  height={36} 
                  sx={{ borderRadius: 1 }}
                />
              </CardActions>
            </Card>
          ))
        ) : (
          filteredCompanies.map((company) => (
            <Card 
              key={company.companyID} 
              sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                height: 280,
                width: '100%',
                minWidth: 280,
                maxWidth: 400,
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2)',
                }
              }}
            >
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {company.name}
                  </Typography>
                  <IconButton 
                    onClick={() => handleExpandClick(company.companyID)}
                    sx={{ color: 'primary.main', ml: 1 }}
                  >
                    {expanded === company.companyID ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                <Collapse in={expanded === company.companyID}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      flex: 1
                    }}
                  >
                    {company.description}
                  </Typography>
                </Collapse>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  onClick={() => router.push(`/company/${company.companyID}/clientlogin`)}
                  sx={{ 
                    mr: 1,
                    flex: 1,
                    background: 'linear-gradient(45deg, #0052cc 30%, #4d8cff 90%)',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0, 82, 204, 0.3)' },
                  }}
                >
                  Sign in as Client
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push(`/company/${company.companyID}/agentlogin`)}
                  sx={{ 
                    flex: 1,
                    background: 'linear-gradient(45deg, #0052cc 30%, #4d8cff 90%)',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0, 82, 204, 0.3)' },
                  }}
                >
                  Sign in as Agent
                </Button>
              </CardActions>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}