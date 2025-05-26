"use client"

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
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Logout, ArrowBack, Visibility, Chat } from '@mui/icons-material';
import toast from 'react-hot-toast';

interface Ticket {
  ticketID: string;
  title: string;
  priority: string;
  status: 'open' | 'closed';
  chatID: string;
}

interface ChatMessage {
  sender: 'client' | 'helper';
  message: string;
  timestamp: string;
}

export default function AgentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const companyid = params.companyid as string;
  const agentid = params.agentid as string;

  const [selectedTab, setSelectedTab] = useState('Assigned Tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiSessionId, setAiSessionId] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [newAiMessage, setNewAiMessage] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`http://localhost:8000/${companyid}/${agentid}/tickets`, {
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
  }, [session?.accessToken, companyid, agentid]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Successfully logged out!');
    router.push('/');
  };

  const handleTabChange = (tab: string) => setSelectedTab(tab);

  const handleViewTicket = (ticket: Ticket) => {
    router.push(`/company/${companyid}/agent/${agentid}/${ticket.ticketID}`);
  };

  const sendMessage = async (message: string) => {
    if (!selectedTicket?.chatID) return;

    const userMessage: ChatMessage = {
      sender: 'helper',
      message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`http://localhost:8000/${companyid}/chat/${selectedTicket.chatID}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          sender: 'helper',
          message,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const sendAiMessage = async (message: string) => {
    if (!aiSessionId) return;

    const userMessage: ChatMessage = {
      sender: 'helper',
      message,
      timestamp: new Date().toISOString(),
    };
    setAiMessages(prev => [...prev, userMessage]);
    setNewAiMessage('');

    try {
      const response = await fetch(`http://localhost:8000/${companyid}/helpers/chat/addmsg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          session_id: aiSessionId,
          query: message,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      
      const aiResponse: ChatMessage = {
        sender: 'helper',
        message: data.response,
        timestamp: new Date().toISOString(),
      };
      setAiMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    try {
      const response = await fetch(`http://localhost:8000/${companyid}/${agentid}/tickets/update/${selectedTicket.ticketID}`, {
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
      
      setTickets(prev => prev.map(t => 
        t.ticketID === selectedTicket.ticketID ? { ...t, status: 'closed' } : t
      ));
      setChatOpen(false);
      toast.success('Ticket closed successfully');
    } catch (error) {
      toast.error('Failed to close ticket');
    }
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
            {agentid}
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
          {['Assigned Tickets', 'History'].map((text) => (
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
        <Typography variant="h4" sx={{ mb: 3 }}>
          {selectedTab}
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticket ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets
                .filter(ticket => 
                  selectedTab === 'Assigned Tickets' ? ticket.status === 'open' : ticket.status === 'closed'
                )
                .map((ticket) => (
                  <TableRow key={ticket.ticketID}>
                    <TableCell>{ticket.ticketID}</TableCell>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>{ticket.priority}</TableCell>
                    <TableCell>{ticket.status}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewTicket(ticket)}>
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </Box>

      {/* Chat Dialog */}
      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => setChatOpen(false)}>
              <ArrowBack />
            </IconButton>
            <Typography>Ticket Chat</Typography>
          </Box>
          {selectedTicket?.status === 'open' && (
            <Button
              variant="contained"
              color="error"
              onClick={handleCloseTicket}
            >
              Close Ticket
            </Button>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, height: '70vh' }}>
            {/* Main Chat */}
            <Paper sx={{ flex: 2, p: 2, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                {messages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender === 'helper' ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1,
                        maxWidth: '80%',
                        bgcolor: msg.sender === 'helper' ? '#1976d2' : '#f5f5f5',
                        color: msg.sender === 'helper' ? 'white' : 'black',
                      }}
                    >
                      <Typography variant="body2">{msg.message}</Typography>
                    </Paper>
                  </Box>
                ))}
                {isTyping && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                    <Paper sx={{ p: 1, bgcolor: '#f5f5f5' }}>
                      <Typography variant="body2">Client is typing...</Typography>
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
                  disabled={selectedTicket?.status === 'closed'}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (newMessage.trim()) {
                      sendMessage(newMessage.trim());
                    }
                  }}
                  disabled={!newMessage.trim() || selectedTicket?.status === 'closed'}
                >
                  Send
                </Button>
              </Box>
            </Paper>

            {/* AI Chat */}
            <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>AI Assistant</Typography>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                {aiMessages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender === 'helper' ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1,
                        maxWidth: '80%',
                        bgcolor: msg.sender === 'helper' ? '#1976d2' : '#f5f5f5',
                        color: msg.sender === 'helper' ? 'white' : 'black',
                      }}
                    >
                      <Typography variant="body2">{msg.message}</Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  value={newAiMessage}
                  onChange={(e) => setNewAiMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newAiMessage.trim()) {
                      sendAiMessage(newAiMessage.trim());
                    }
                  }}
                  placeholder="Ask AI..."
                  disabled={selectedTicket?.status === 'closed'}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (newAiMessage.trim()) {
                      sendAiMessage(newAiMessage.trim());
                    }
                  }}
                  disabled={!newAiMessage.trim() || selectedTicket?.status === 'closed'}
                >
                  Send
                </Button>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}