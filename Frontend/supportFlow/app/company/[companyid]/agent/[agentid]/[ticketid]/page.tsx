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
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Logout, ArrowBack, Chat, Description } from '@mui/icons-material';
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

export default function TicketDetailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const companyid = params.companyid as string;
  const agentid = params.agentid as string;
  const ticketid = params.ticketid as string;

  const [selectedTab, setSelectedTab] = useState('Chatroom');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiSessionId, setAiSessionId] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [newAiMessage, setNewAiMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const fetchTicketAndChat = async () => {
      try {
        // Fetch ticket details
        const ticketResponse = await fetch(`http://localhost:8000/${companyid}/${agentid}/tickets/get_ticket/${ticketid}`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        });
        if (!ticketResponse.ok) throw new Error('Failed to fetch ticket');
        const ticketData = await ticketResponse.json();
        // Handle array response and get first ticket
        const ticket = Array.isArray(ticketData) ? ticketData[0] : ticketData;
        if (!ticket) throw new Error('No ticket found');
        setTicket(ticket);

        // Only fetch chat messages if we have a valid chatID
        if (ticket.chatID) {
          // Fetch chat messages
          const chatResponse = await fetch(`http://localhost:8000/${companyid}/chat/${ticket.chatID}`, {
            headers: { Authorization: `Bearer ${session?.accessToken}` },
          });
          if (!chatResponse.ok) throw new Error('Failed to fetch chat messages');
          const chatData = await chatResponse.json();
          setMessages(chatData.chat_history_human || []);

          // Create AI chat session
          const aiResponse = await fetch(`http://localhost:8000/${companyid}/helpers/chat/create`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${session?.accessToken}` },
          });
          if (!aiResponse.ok) throw new Error('Failed to create AI chat session');
          const aiData = await aiResponse.json();
          setAiSessionId(aiData.session_id);
        } else {
          toast.error('No chat ID found for this ticket');
        }
      } catch (error) {
        toast.error('Error loading ticket and chat');
      } finally {
        setLoading(false);
      }
    };
    if (session?.accessToken) fetchTicketAndChat();
  }, [session?.accessToken, companyid, agentid, ticketid]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Successfully logged out!');
    router.push('/');
  };

  const handleTabChange = (tab: string) => setSelectedTab(tab);

  const sendMessage = async (message: string) => {
    if (!ticket?.chatID) return;

    const userMessage: ChatMessage = {
      sender: 'helper',
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
    setIsAiLoading(true);

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
        sender: 'client',
        message: data.response,
        timestamp: new Date().toISOString(),
      };
      setAiMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticket) return;

    try {
      const response = await fetch(`http://localhost:8000/${companyid}/${agentid}/tickets/update/${ticket.ticketID}`, {
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
      router.push(`/company/${companyid}/agent/${agentid}`);
    } catch (error) {
      toast.error('Failed to close ticket');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
          <ListItem disablePadding>
            <ListItemButton onClick={() => router.push(`/company/${companyid}/agent/${agentid}`)}>
              <ListItemText primary="Back" />
            </ListItemButton>
          </ListItem>
          {['Chatroom', 'Ticket Details'].map((text) => (
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
        {selectedTab === 'Chatroom' ? (
          <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 100px)' }}>
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
                  disabled={ticket?.status === 'closed'}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (newMessage.trim()) {
                      sendMessage(newMessage.trim());
                    }
                  }}
                  disabled={!newMessage.trim() || ticket?.status === 'closed'}
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
                {isAiLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                    <Paper sx={{ p: 1, bgcolor: '#f5f5f5' }}>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body2">AI is thinking...</Typography>
                    </Paper>
                  </Box>
                )}
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
                  disabled={ticket?.status === 'closed' || isAiLoading}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (newAiMessage.trim()) {
                      sendAiMessage(newAiMessage.trim());
                    }
                  }}
                  disabled={!newAiMessage.trim() || ticket?.status === 'closed' || isAiLoading}
                >
                  Send
                </Button>
              </Box>
            </Paper>
          </Box>
        ) : (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>Ticket Details</Typography>
            {ticket && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">Ticket ID: {ticket.ticketID}</Typography>
                  <Typography variant="subtitle1">Title: {ticket.title}</Typography>
                  <Typography variant="subtitle1">Priority: {ticket.priority}</Typography>
                  <Typography variant="subtitle1">Status: {ticket.status}</Typography>
                </Box>
                {ticket.status === 'open' && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCloseTicket}
                  >
                    Close Ticket
                  </Button>
                )}
              </>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
}
