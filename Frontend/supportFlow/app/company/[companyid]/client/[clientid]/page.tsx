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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  Fab,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Logout, Visibility, Add, Chat, Minimize, Close } from '@mui/icons-material';
import toast from 'react-hot-toast';

interface Ticket {
  ticketID: string;
  title: string;
  status: 'open' | 'closed';
  assigned_helper: string;
}

interface ChatMessage {
  sender: 'client' | 'AI';
  message: string;
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  response: string;
  confidence: number;
  emotion: {
    label: string;
    score: number;
  };
}

export default function ClientPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const companyid = params.companyid as string;
  const clientid = params.clientid as string;

  const [selectedTab, setSelectedTab] = useState('Create Ticket');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createChatSession = async () => {
    try {
      const response = await fetch(`http://localhost:8000/${companyid}/chat/${clientid}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat session');
      }

      const data = await response.json();
      setChatId(data.chatID);
      return data.chatID;
    } catch (error) {
      toast.error('Failed to create chat session');
      return null;
    }
  };

  const sendMessage = async (message: string) => {
    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = await createChatSession();
      if (!currentChatId) return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      sender: 'client',
      message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`http://localhost:8000/${companyid}/chat/${currentChatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          sender: 'client',
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data: ChatResponse = await response.json();
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        sender: 'AI',
        message: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Ensure we have a chat ID
      let currentChatId = chatId;
      if (!currentChatId) {
        currentChatId = await createChatSession();
        if (!currentChatId) {
          throw new Error('Failed to create chat session');
        }
      }

      const ticketPayload = {
        ticketID: "filler",
        clientID: clientid,
        assigned_helper: "Unassigned",
        title: formData.title,
        description: formData.description,
        priority: 'Low',
        status: 'open',
        chatID: currentChatId
      };

      const response = await fetch(`http://localhost:8000/${companyid}/${clientid}/tickets/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(ticketPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create ticket');
      }

      const ticketData = await response.json();

      // Handle file uploads if there are any
      if (files.length > 0) {
        const formDataFiles = new FormData();
        files.forEach((file) => {
          if (!file.name.endsWith('.pdf')) {
            toast.error('Only PDF files are allowed');
            return;
          }
          formDataFiles.append('file', file);
        });

        const fileResponse = await fetch(`http://localhost:8000/${companyid}/chat/${currentChatId}/add-files`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          body: formDataFiles,
        });

        if (!fileResponse.ok) {
          throw new Error('Failed to upload files');
        }

        // Update chat mode to human
        
      }
      await fetch(`http://localhost:8000/${companyid}/chat/${currentChatId}/mode`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ chat_mode: 'human' }),
      });
      toast.success('Ticket created successfully');
      setFormData({ title: '', description: '' });
      setFiles([]);
      
      // Refresh tickets
      setLoading(true);
      const ticketsResponse = await fetch(`http://localhost:8000/${companyid}/${clientid}/tickets`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (!ticketsResponse.ok) throw new Error('Failed to fetch tickets');
      const ticketsData = await ticketsResponse.json();
      setTickets(ticketsData);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`http://localhost:8000/${companyid}/${clientid}/tickets`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        });
        if (!response.ok) throw new Error('Failed to fetch tickets');
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        toast.error('Error fetching tickets');
      } finally {
        setLoading(false);
      }
    };
    if (session?.accessToken) fetchTickets();
  }, [session?.accessToken, companyid, clientid]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Successfully logged out!');
    router.push('/');
  };

  const handleTabChange = (tab: string) => setSelectedTab(tab);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top App Bar */}
      <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'white' }}>
            SupportFlow
          </Typography>
          <Typography variant="body1" sx={{ mr: 2, color: 'white' }}>
            {clientid}
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
          {['Create Ticket', 'Open Tickets', 'History'].map((text) => (
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
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: '240px' }}>
        {selectedTab === 'Create Ticket' && (
          <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>Create Ticket</Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                fullWidth
                margin="normal"
                required
                disabled={isSubmitting}
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                required
                disabled={isSubmitting}
              />
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Supporting Files</Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Add />}
                sx={{ mt: 1, color: '#1976d2', borderColor: '#1976d2' }}
                disabled={isSubmitting}
              >
                Add Files
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files) {
                      const pdfFiles = Array.from(e.target.files).filter(file => file.name.endsWith('.pdf'));
                      if (pdfFiles.length !== e.target.files.length) {
                        toast.error('Only PDF files are allowed');
                      }
                      setFiles(pdfFiles);
                    }
                  }}
                />
              </Button>
              {files.length > 0 && (
                <Typography sx={{ mt: 1 }}>
                  Selected files: {files.map((file) => file.name).join(', ')}
                </Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setFormData({ title: '', description: '' })}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  sx={{ bgcolor: '#1976d2' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Creating Ticket...
                    </Box>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
        {selectedTab === 'Open Tickets' && (
          <TicketList
            tickets={tickets.filter((ticket) => ticket.status === 'open')}
            loading={loading}
            companyid={companyid}
            clientid={clientid}
          />
        )}
        {selectedTab === 'History' && (
          <TicketList
            tickets={tickets.filter((ticket) => ticket.status === 'closed')}
            loading={loading}
            companyid={companyid}
            clientid={clientid}
          />
        )}
      </Box>

      {/* Floating Chat Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setChatOpen(true)}
      >
        <Chat />
      </Fab>

      {/* Chat Box */}
      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        sx={{ '& .MuiDialog-paper': { position: 'fixed', bottom: 16, right: 16, m: 0 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Chat Support
          <Box>
            <IconButton onClick={() => setChatOpen(false)}>
              <Minimize />
            </IconButton>
            <IconButton onClick={() => setChatOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ width: 300, height: 400, p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.sender === 'client' ? 'flex-end' : 'flex-start',
                    mb: 1,
                  }}
                >
                  <Paper
                    sx={{
                      p: 1,
                      maxWidth: '80%',
                      bgcolor: msg.sender === 'client' ? '#1976d2' : '#f5f5f5',
                      color: msg.sender === 'client' ? 'white' : 'black',
                    }}
                  >
                    <Typography variant="body2">{msg.message}</Typography>
                  </Paper>
                </Box>
              ))}
              {isTyping && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                  <Paper sx={{ p: 1, bgcolor: '#f5f5f5' }}>
                    <Typography variant="body2">AI is typing...</Typography>
                  </Paper>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newMessage.trim()) {
                    sendMessage(newMessage.trim());
                  }
                }}
                placeholder="Type your message..."
              />
              <Button
                variant="contained"
                onClick={() => {
                  if (newMessage.trim()) {
                    sendMessage(newMessage.trim());
                  }
                }}
                disabled={!newMessage.trim()}
              >
                Send
              </Button>
            </Box>
          </Paper>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  companyid: string;
  clientid: string;
}

function TicketList({ tickets, loading, companyid, clientid }: TicketListProps) {
  const router = useRouter();

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h4">{tickets[0]?.status === 'open' ? 'Open Tickets' : 'History'}</Typography>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Ticket ID</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Assigned Helper</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.ticketID}>
              <TableCell>{ticket.ticketID}</TableCell>
              <TableCell>{ticket.title}</TableCell>
              <TableCell>{ticket.status}</TableCell>
              <TableCell>{ticket.assigned_helper || 'Unassigned'}</TableCell>
              <TableCell>
                <IconButton onClick={() => router.push(`/company/${companyid}/client/${clientid}/${ticket.ticketID}`)}>
                  <Visibility />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}