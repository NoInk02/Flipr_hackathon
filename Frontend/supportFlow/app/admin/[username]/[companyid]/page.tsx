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
  TextField,
  CircularProgress,
  Input,
  Skeleton,
  ListItemText as MuiListItemText,
  InputAdornment,
} from '@mui/material';
import { Logout, Add, ArrowBack, Close as CloseIcon, Add as AddIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import toast from 'react-hot-toast';

interface FileReference {
  file_id: string;
  filename: string;
  content_type?: string;
}

interface AgentData {
  helperID: string;
  password: string;
}

interface CompanyData {
  companyID: string;
  name: string;
  description: string;
  context_files: FileReference[];
  faqDICT: { [key: string]: string };
  helpers: AgentData[];
}

type FaqItem = { id: string; question: string; answer: string };

export default function CompanyDetails() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const companyid = params.companyid as string;

  const [selectedTab, setSelectedTab] = useState('Company Details');
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [formData, setFormData] = useState<CompanyData>({} as CompanyData);
  const [faqList, setFaqList] = useState<FaqItem[]>([]);
  const [originalFaqList, setOriginalFaqList] = useState<FaqItem[]>([]);
  const [newAgentUsername, setNewAgentUsername] = useState('');
  const [newAgentPassword, setNewAgentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editingAgentPassword, setEditingAgentPassword] = useState('');
  const [editingPasswordError, setEditingPasswordError] = useState('');

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`http://localhost:8000/company/${companyid}`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        });
        if (!response.ok) throw new Error('Failed to fetch company');
        const data: CompanyData = await response.json();
        setCompany(data);
        setFormData(data);
        const initialFaqList = Object.entries(data.faqDICT).map(([question, answer], index) => ({
          id: `faq-${index}`,
          question,
          answer,
        }));
        setFaqList(initialFaqList);
        setOriginalFaqList(initialFaqList);
      } catch (error) {
        toast.error('Error fetching company');
      } finally {
        setLoading(false);
      }
    };
    if (session?.accessToken && companyid) fetchCompany();
  }, [session?.accessToken, companyid]);

  useEffect(() => {
    setHasChanges(
      JSON.stringify(formData) !== JSON.stringify(company) ||
      JSON.stringify(faqList) !== JSON.stringify(originalFaqList)
    );
  }, [formData, company, faqList, originalFaqList]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Successfully logged out!');
    router.push('/');
  };

  const handleTabChange = (tab: string) => setSelectedTab(tab);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteFile = (fileId: string, type: 'context_files') => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((file) => file.file_id !== fileId),
    }));
  };

  const handleFaqChange = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveFaq = (id: string) => {
    setFaqList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddFaq = () => {
    const newId = `faq-${faqList.length}`;
    setFaqList((prev) => [...prev, { id: newId, question: '', answer: '' }]);
  };

  const handleRemoveAgent = (username: string) => {
    setFormData((prev) => ({
      ...prev,
      helpers: prev.helpers.filter((agent) => agent.helperID !== username),
    }));
  };

  const handleAddAgent = () => {
    if (!newAgentUsername || !newAgentPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newAgentPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (formData.helpers.some(agent => agent.helperID === newAgentUsername)) {
      toast.error('Agent with this username already exists');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      helpers: [...prev.helpers, { helperID: newAgentUsername, password: newAgentPassword }],
    }));
    setNewAgentUsername('');
    setNewAgentPassword('');
    setPasswordError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewAgentPassword(value);
    if (value.length > 0 && value.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
    } else {
      setPasswordError('');
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updatedFaqDict = faqList.reduce((acc, item) => {
        if (item.question && item.answer) acc[item.question] = item.answer;
        return acc;
      }, {} as { [key: string]: string });

      const payload = { ...formData, faqDICT: updatedFaqDict };
      const response = await fetch(`http://localhost:8000/company/${companyid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update company');
      toast.success('Company updated successfully');
      const refreshedCompany = await fetch(`http://localhost:8000/company/${companyid}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      }).then((res) => res.json());
      setCompany(refreshedCompany);
      setFormData(refreshedCompany);
      setFaqList(
        Object.entries(refreshedCompany.faqDICT).map(([q, a], i) => ({ id: `faq-${i}`, question: q, answer: a as string }))
      );
      setOriginalFaqList(
        Object.entries(refreshedCompany.faqDICT).map(([q, a], i) => ({ id: `faq-${i}`, question: q, answer: a as string }))
      );
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    if (company) {
      setFormData(company);
      setFaqList(originalFaqList);
      setHasChanges(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        const response = await fetch(`http://localhost:8000/company/${companyid}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        });
        if (!response.ok) throw new Error('Failed to delete company');
        toast.success('Company deleted successfully');
        router.push(`/admin/${username}`);
      } catch (error) {
        toast.error('Error deleting company');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleFileUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataFiles = new FormData();
        formDataFiles.append('files', file);
        const response = await fetch(`http://localhost:8000/company/${companyid}/add_files`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          body: formDataFiles,
        });
        if (!response.ok) throw new Error('Failed to upload files');
      });

      await Promise.all(uploadPromises);
      toast.success('Files uploaded successfully');
      
      // Refresh company data to update the context files section
      const response = await fetch(`http://localhost:8000/company/${companyid}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch updated company data');
      const updatedCompany = await response.json();
      setCompany(updatedCompany);
      setFormData(updatedCompany);
    } catch (error) {
      toast.error('Error uploading files');
    } finally {
      setIsUploading(false);
      setFiles([]);
    }
  };

  const handleEditAgent = (agentId: string) => {
    setEditingAgentId(agentId);
    const agent = formData.helpers.find(a => a.helperID === agentId);
    if (agent) {
      setEditingAgentPassword(agent.password);
    }
  };

  const handleSaveAgentEdit = () => {
    if (!editingAgentId) return;

    if (editingAgentPassword.length < 6) {
      setEditingPasswordError('Password must be at least 6 characters long');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      helpers: prev.helpers.map(agent =>
        agent.helperID === editingAgentId
          ? { ...agent, password: editingAgentPassword }
          : agent
      ),
    }));

    setEditingAgentId(null);
    setEditingAgentPassword('');
    setEditingPasswordError('');
  };

  const handleCancelEdit = () => {
    setEditingAgentId(null);
    setEditingAgentPassword('');
    setEditingPasswordError('');
  };

  const handleEditingPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditingAgentPassword(value);
    if (value.length > 0 && value.length < 6) {
      setEditingPasswordError('Password must be at least 6 characters long');
    } else {
      setEditingPasswordError('');
    }
  };

  if (loading) return <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%' }} />;

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
          <ListItem>
            <ListItemButton onClick={() => router.push(`/admin/${username}`)}>
              <ArrowBack sx={{ mr: 1 }} />
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          {['Company Details', 'Company Analytics'].map((text) => (
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
        {selectedTab === 'Company Details' && (
          <Box>
            <Typography variant="h4">Company Details</Typography>
            <TextField
              label="Company ID"
              name="companyID"
              value={formData.companyID || ''}
              disabled
              fullWidth
              margin="normal"
              helperText="Company ID cannot be changed after creation"
            />
            <TextField
              label="Name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              disabled={isUpdating || isUploading}
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              disabled={isUpdating || isUploading}
            />

            {/* Context Files */}
            <Typography variant="h6" sx={{ mt: 2 }}>Context Files</Typography>
            <List>
              {formData.context_files.map((file) => (
                <ListItem key={file.file_id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <MuiListItemText primary={file.filename} />
                  <IconButton onClick={() => handleDeleteFile(file.file_id, 'context_files')}>
                    <CloseIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>

            {/* File Upload */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                component="label"
                sx={{ mr: 2, color: '#1976d2', borderColor: '#1976d2' }}
                disabled={isUploading || isUpdating}
              >
                Add Files
                <Input
                  type="file"
                  inputProps={{ multiple: true, accept: '.pdf,.png,.jpg,.jpeg,.txt' }}
                  onChange={handleFileChange}
                  sx={{ display: 'none' }}
                />
              </Button>
              <Button
                variant="contained"
                onClick={handleFileUpload}
                disabled={files.length === 0 || isUploading || isUpdating}
                sx={{ bgcolor: '#1976d2' }}
              >
                {isUploading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
              </Button>
            </Box>
            {files.length > 0 && (
              <Typography sx={{ mt: 1 }}>
                Selected files: {files.map((file) => file.name).join(', ')}
              </Typography>
            )}

            {/* FAQs */}
            <Typography variant="h6" sx={{ mt: 2 }}>FAQs</Typography>
            {faqList.map((faqItem) => (
              <Box key={faqItem.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                  label="Question"
                  value={faqItem.question}
                  onChange={(e) => handleFaqChange(faqItem.id, 'question', e.target.value)}
                  fullWidth
                  disabled={isUpdating || isUploading}
                />
                <TextField
                  label="Answer"
                  value={faqItem.answer}
                  onChange={(e) => handleFaqChange(faqItem.id, 'answer', e.target.value)}
                  fullWidth
                  disabled={isUpdating || isUploading}
                />
                <IconButton 
                  onClick={() => handleRemoveFaq(faqItem.id)}
                  disabled={isUpdating || isUploading}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddFaq}
              disabled={isUpdating || isUploading}
              sx={{ bgcolor: '#1976d2', color: 'white', '&:hover': { bgcolor: '#1565c0' } }}
            >
              Add FAQ
            </Button>

            {/* Agents */}
            <Typography variant="h6" sx={{ mt: 2 }}>Agents</Typography>
            <List>
              {formData.helpers.map((agent, index) => (
                <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {editingAgentId === agent.helperID ? (
                    <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'center' }}>
                      <Typography sx={{ minWidth: '150px' }}>{agent.helperID}</Typography>
                      <TextField
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        value={editingAgentPassword}
                        onChange={handleEditingPasswordChange}
                        error={!!editingPasswordError}
                        helperText={editingPasswordError}
                        fullWidth
                        disabled={isUpdating || isUploading}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleSaveAgentEdit}
                        disabled={isUpdating || isUploading || !!editingPasswordError}
                        sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleCancelEdit}
                        disabled={isUpdating || isUploading}
                      >
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <MuiListItemText primary={agent.helperID} />
                      <Box>
                        <Button
                          variant="outlined"
                          onClick={() => handleEditAgent(agent.helperID)}
                          disabled={isUpdating || isUploading}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <IconButton onClick={() => handleRemoveAgent(agent.helperID)}>
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Username"
                value={newAgentUsername}
                onChange={(e) => setNewAgentUsername(e.target.value)}
                fullWidth
                disabled={isUpdating || isUploading}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={newAgentPassword}
                onChange={handlePasswordChange}
                error={!!passwordError}
                helperText={passwordError}
                fullWidth
                disabled={isUpdating || isUploading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddAgent}
                disabled={isUpdating || isUploading || !!passwordError}
                sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
              >
                Add Agent
              </Button>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                onClick={handleUpdate}
                disabled={isUpdating || isUploading}
                sx={{ mr: 1, bgcolor: '#1976d2' }}
              >
                {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Update'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={!hasChanges || isUpdating || isUploading}
                sx={{ mr: 1 }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={isUpdating || isUploading}
              >
                Delete
              </Button>
            </Box>
          </Box>
        )}
        {selectedTab === 'Company Analytics' && (
          <Box>
            <Typography variant="h4">Company Analytics</Typography>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
            <Typography sx={{ mt: 2 }}>Company-specific analytics will be displayed here.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}