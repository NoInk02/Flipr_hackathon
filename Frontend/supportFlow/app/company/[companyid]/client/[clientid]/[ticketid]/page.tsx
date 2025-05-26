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
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Logout, ArrowBack, Chat, Minimize, Close } from '@mui/icons-material';
import toast from 'react-hot-toast';

interface Ticket {
  ticketID: string;
  clientID: string;
  assigned_helper: string;
  priority: string;
  status: 'open' | 'closed';
  title: string;
  description: string;
  chatID: string;
}

interface ChatMessage {
  sender: 'client' | 'helper';
  message: string;
  timestamp: string;
}

export default function TicketPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const companyid = params.companyid as string;
  const clientid = params.clientid as string;
  const ticketid = params.ticketid as string;

  const [selectedTab, setSelectedTab] = useState('Ticket Details');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`http://localhost:8000/${companyid}/${clientid}/tickets/get_ticket/${ticketid}`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        });
        if (!response.ok) throw new Error('Failed to fetch ticket');
        const data = await response.json();
        if (data.length > 0) {
          setTicket(data[0]);
          // Fetch chat messages if ticket exists
          if (data[0].chatID) {
            fetchChatMessages(data[0].chatID);
          }
        }
      } catch (error) {
        toast.error('Error fetching ticket');
      } finally {
        setLoading(false);
      }
    };
    if (session?.accessToken) fetchTicket();
  }, [session?.accessToken, companyid, clientid, ticketid]);

  const fetchChatMessages = async (chatId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/${companyid}/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch chat messages');
      const data = await response.json();
      setMessages(data.chat_history_human || []);
    } catch (error) {
      toast.error('Error fetching chat messages');
    }
  };

  const sendMessage = async (message: string) => {
    if (!ticket?.chatID) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      sender: 'client',
      message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`http://localhost:8000/${companyid}/chat/${ticket.chatID}/message`, {
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
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticket) return;

    try {
      const response = await fetch(`http://localhost:8000/${companyid}/${clientid}/tickets/update/${ticketid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          status: 'closed',
        }),
      });

      if (!response.ok) throw new Error('Failed to close ticket');
      
      setTicket(prev => prev ? { ...prev, status: 'closed' } : null);
      toast.success('Ticket closed successfully');
    } catch (error) {
      toast.error('Failed to close ticket');
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Successfully logged out!');
    router.push('/');
  };

  const handleTabChange = (tab: string) => setSelectedTab(tab);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Ticket not found</Typography>
      </Box>
    );
  }

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
          <ListItem>
            <ListItemButton onClick={() => router.push(`/company/${companyid}/client/${clientid}`)}>
              <ArrowBack sx={{ mr: 1 }} />
              <ListItemText primary="Back" />
            </ListItemButton>
          </ListItem>
          {['Ticket Details', 'Chat Room'].map((text) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                selected={selectedTab === text}
                onClick={() => handleTabChange(text)}
                sx={{ '&.Mui-selected': { bgcolor: '#e3f2fd' } }}
                disabled={text === 'Chat Room' && ticket.status === 'closed'}
              >
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: '240px' }}>
        {selectedTab === 'Ticket Details' && (
          <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>Ticket Details</Typography>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Title</Typography>
              <Typography paragraph>{ticket.title}</Typography>
              
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography paragraph>{ticket.description}</Typography>
              
              <Typography variant="h6" gutterBottom>Status</Typography>
              <Typography paragraph>{ticket.status}</Typography>
              
              <Typography variant="h6" gutterBottom>Priority</Typography>
              <Typography paragraph>{ticket.priority}</Typography>
              
              <Typography variant="h6" gutterBottom>Assigned Helper</Typography>
              <Typography paragraph>{ticket.assigned_helper || 'Unassigned'}</Typography>

              {ticket.status === 'open' && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCloseTicket}
                  sx={{ mt: 2 }}
                >
                  Close Ticket
                </Button>
              )}
            </Paper>
          </Box>
        )}

        {selectedTab === 'Chat Room' && (
          <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>Chat Room</Typography>
            <Paper sx={{ p: 3, height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
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
                      <Typography variant="body2">Helper is typing...</Typography>
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
                  disabled={ticket.status === 'closed'}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (newMessage.trim()) {
                      sendMessage(newMessage.trim());
                    }
                  }}
                  disabled={!newMessage.trim() || ticket.status === 'closed'}
                >
                  Send
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
} 