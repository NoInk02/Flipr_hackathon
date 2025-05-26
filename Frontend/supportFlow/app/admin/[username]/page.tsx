'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Input,
  CircularProgress,
  Grid as Grid2,
} from '@mui/material';
import { Logout, Visibility, Add } from '@mui/icons-material';
import toast from 'react-hot-toast';

interface Company {
  companyID: string;
  name: string;
  description?: string;
  adminID: string;
  faqDICT: { [key: string]: string };
  helpers: string[];
}

interface FormData {
  companyID: string;
  name: string;
  description?: string;
  adminID: string;
  faqDICT: { questions: { question: string; answer: string }[] };
  agents: { email: string; password: string }[];
}

interface OrganizationsProps {
  companies: Company[];
  loading: boolean;
  setOpenCreateDialog: (open: boolean) => void;
  handleViewCompany: (company: Company) => void;
}

interface CreateCompanyDialogProps {
  open: boolean;
  onClose: () => void;
  username: string;
  accessToken: string | undefined;
  refreshCompanies: () => void;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    },
  });
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const [selectedTab, setSelectedTab] = useState('Analytics');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.name !== username) {
      router.push(`/admin/${session.user.name}`);
    }
  }, [status, session, username, router]);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!session?.accessToken) return;
      
      try {
        const response = await fetch('http://localhost:8000/company/', {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        if (!response.ok) throw new Error('Failed to fetch companies');
        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        toast.error('Error fetching companies');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [session?.accessToken]);

  if (status === 'loading' || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Successfully logged out!');
    router.push('/');
  };

  const handleTabChange = (tab: string) => setSelectedTab(tab);

  const handleViewCompany = (company: Company) => {
    router.push(`/admin/${username}/${company.companyID}`);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top App Bar */}
      <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SupportFlow
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {username}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', mt: 8, bgcolor: '#f5f5f5' },
        }}
      >
        <List>
          {['Analytics', 'Organizations'].map((text) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                selected={selectedTab === text}
                onClick={() => handleTabChange(text)}
                sx={{ '&.Mui-selected': { bgcolor: '#e3f2fd' } }}
              >
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {selectedTab === 'Analytics' && <Analytics />}
        {selectedTab === 'Organizations' && (
          <Organizations
            companies={companies}
            loading={loading}
            setOpenCreateDialog={setOpenCreateDialog}
            handleViewCompany={handleViewCompany}
          />
        )}
      </Box>

      {/* Create Dialog */}
      <CreateCompanyDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        username={username}
        accessToken={session?.accessToken}
        refreshCompanies={() => {
          setLoading(true);
          fetch('http://localhost:8000/company/', {
            headers: { Authorization: `Bearer ${session?.accessToken}` },
          })
            .then((res) => res.json())
            .then((data) => setCompanies(data))
            .finally(() => setLoading(false));
        }}
      />
    </Box>
  );
}

function Analytics() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Analytics</Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 3 
      }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>Average Handling Time</Typography>
          <Box sx={{ 
            width: '100%', 
            height: 200, 
            bgcolor: 'background.paper',
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            <img 
              src="/averageHandlingtime.jpeg" 
              alt="Average Handling Time"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>Response Confidence</Typography>
          <Box sx={{ 
            width: '100%', 
            height: 200, 
            bgcolor: 'background.paper',
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            <img 
              src="/Average Response Confidence.jpeg" 
              alt="Average Response Confidence"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>CSAT Score Analysis</Typography>
          <Box sx={{ 
            width: '100%', 
            height: 200, 
            bgcolor: 'background.paper',
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            <img 
              src="/Low CSAT Score counts.jpeg" 
              alt="Low CSAT Score Counts"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>Emotion Distribution</Typography>
          <Box sx={{ 
            width: '100%', 
            height: 200, 
            bgcolor: 'background.paper',
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            <img 
              src="/EmotionDistributionPerSession.jpeg" 
              alt="Emotion Distribution Per Session"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Organizations({ companies, loading, setOpenCreateDialog, handleViewCompany }: OrganizationsProps) {
  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h4">Organizations</Typography>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>URL</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.companyID}>
              <TableCell>{company.name}</TableCell>
              <TableCell>{`/${company.companyID}`}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleViewCompany(company)}>
                  <Visibility />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        variant="contained"
        startIcon={<Add />}
        sx={{ mt: 2, float: 'right' }}
        onClick={() => setOpenCreateDialog(true)}
      >
        Create Organization
      </Button>
    </Box>
  );
}

function CreateCompanyDialog({ open, onClose, username, accessToken, refreshCompanies }: CreateCompanyDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    companyID: '',
    name: '',
    description: '',
    adminID: username,
    faqDICT: { questions: [{ question: '', answer: '' }] },
    agents: [{ email: '', password: '' }],
  });
  const [contextFiles, setContextFiles] = useState<File[]>([]);

  const addFaq = () => {
    setFormData({
      ...formData,
      faqDICT: { questions: [...formData.faqDICT.questions, { question: '', answer: '' }] },
    });
  };

  const addAgent = () => {
    setFormData({
      ...formData,
      agents: [...formData.agents, { email: '', password: '' }],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const faqDict = formData.faqDICT.questions.reduce((acc: { [key: string]: string }, { question, answer }) => {
      if (question && answer) acc[question] = answer;
      return acc;
    }, {});
    const payload = { ...formData, faqDICT: faqDict };

    try {
      const response = await fetch('http://localhost:8000/company/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create company');
      }
      const { id } = await response.json();

      // Upload files if any
      if (contextFiles.length > 0) {
        const formDataFiles = new FormData();
        contextFiles.forEach((file) => formDataFiles.append('files', file));
        await fetch(`http://localhost:8000/company/${id}/add_files`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formDataFiles,
        });
      }

      toast.success('Company created successfully');
      refreshCompanies();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create Organization</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Company ID"
            value={formData.companyID}
            onChange={(e) => setFormData({ ...formData, companyID: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Context Files</Typography>
          <Input
            type="file"
            inputProps={{ multiple: true }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files) {
                setContextFiles(Array.from(e.target.files));
              }
            }}
            fullWidth
          />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>FAQs</Typography>
          {formData.faqDICT.questions.map((faq, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <TextField
                label="Question"
                value={faq.question}
                onChange={(e) => {
                  const newQuestions = [...formData.faqDICT.questions];
                  newQuestions[index].question = e.target.value;
                  setFormData({ ...formData, faqDICT: { questions: newQuestions } });
                }}
                fullWidth
              />
              <TextField
                label="Answer"
                value={faq.answer}
                onChange={(e) => {
                  const newQuestions = [...formData.faqDICT.questions];
                  newQuestions[index].answer = e.target.value;
                  setFormData({ ...formData, faqDICT: { questions: newQuestions } });
                }}
                fullWidth
              />
            </Box>
          ))}
          <Button startIcon={<Add />} onClick={addFaq} sx={{ mt: 1 }}>
            Add FAQ
          </Button>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Agents</Typography>
          {formData.agents.map((agent, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <TextField
                label="Email"
                value={agent.email}
                onChange={(e) => {
                  const newAgents = [...formData.agents];
                  newAgents[index].email = e.target.value;
                  setFormData({ ...formData, agents: newAgents });
                }}
                fullWidth
              />
              <TextField
                label="Password"
                value={agent.password}
                onChange={(e) => {
                  const newAgents = [...formData.agents];
                  newAgents[index].password = e.target.value;
                  setFormData({ ...formData, agents: newAgents });
                }}
                fullWidth
              />
            </Box>
          ))}
          <Button startIcon={<Add />} onClick={addAgent} sx={{ mt: 1 }}>
            Add Agent
          </Button>
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Create
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}