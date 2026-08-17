import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  InputAdornment,
  type SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useNavigate, useParams } from 'react-router-dom';
import { getTicketsApi, getTicketByIdApi, updateTicketStatusApi } from '../api/tickets';
import { getCommentsApi, createCommentApi } from '../api/comments';
import { getAttachmentsApi, uploadAttachmentApi, deleteAttachmentApi, getAttachmentDownloadUrl } from '../api/attachments';
import type { TicketDto, CommentDto, AttachmentDto, Status, Priority, Category } from '../types/ticket';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../context/ColorModeContext';

export const TicketsWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // List State
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(id ? Number(id) : null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter States
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('');

  // Selected Ticket Detail State
  const [ticketDetail, setTicketDetail] = useState<TicketDto | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [attachment, setAttachment] = useState<AttachmentDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Comment & Attachment Actions
  const [commentBody, setCommentBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Error & Status Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { role } = useAuth();
  const { mode } = useColorMode();
  const isDark = mode === 'dark';
  const canEditStatus = role === 'AGENT' || role === 'ADMIN';

  // 1. Fetch Ticket List
  const fetchTickets = async () => {
    setLoadingList(true);
    setErrorMsg(null);
    try {
      const data = await getTicketsApi({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined,
      });
      setTickets(data);
      // Auto-select first ticket if none selected
      if (data.length > 0 && !selectedTicketId) {
        setSelectedTicketId(data[0].id);
      }
    } catch (err: any) {
      setErrorMsg('Failed to load tickets list.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  // Sync selected ID when URL parameter changes
  useEffect(() => {
    if (id) {
      setSelectedTicketId(Number(id));
    }
  }, [id]);

  // 2. Fetch Details for Selected Ticket
  const fetchTicketDetails = async (ticketId: number) => {
    setLoadingDetail(true);
    setErrorMsg(null);
    try {
      const [ticketData, commentsData, attachmentsData] = await Promise.all([
        getTicketByIdApi(ticketId),
        getCommentsApi(ticketId),
        getAttachmentsApi(ticketId),
      ]);
      setTicketDetail(ticketData);
      setComments(commentsData);
      setAttachment(attachmentsData.length > 0 ? attachmentsData[0] : null);
    } catch (err: any) {
      setErrorMsg('Failed to load ticket details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedTicketId) {
      fetchTicketDetails(selectedTicketId);
    } else {
      setTicketDetail(null);
    }
  }, [selectedTicketId]);

  // Handle Ticket Select in List
  const handleSelectTicket = (tId: number) => {
    setSelectedTicketId(tId);
    navigate(`/tickets/${tId}`, { replace: true });
  };

  // Status Change Handler
  const handleStatusChange = async (newStatus: Status) => {
    if (!ticketDetail) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updated = await updateTicketStatusApi(ticketDetail.id, { status: newStatus });
      setTicketDetail(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSuccessMsg(`Status updated to ${newStatus}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Post Comment Handler
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDetail || !commentBody.trim()) return;
    setSubmittingComment(true);
    setErrorMsg(null);
    try {
      const newComment = await createCommentApi(ticketDetail.id, { body: commentBody });
      setComments((prev) => [...prev, newComment]);
      setCommentBody('');
    } catch (err: any) {
      setErrorMsg('Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Upload File Handler
  const handleUploadFile = async () => {
    if (!ticketDetail || !selectedFile) return;
    setUploadingFile(true);
    setErrorMsg(null);
    try {
      const newAttachment = await uploadAttachmentApi(ticketDetail.id, selectedFile);
      setAttachment(newAttachment);
      setSelectedFile(null);
    } catch (err: any) {
      setErrorMsg('Failed to upload file.');
    } finally {
      setUploadingFile(false);
    }
  };

  // Delete File Handler
  const handleDeleteFile = async () => {
    if (!ticketDetail || !attachment) return;
    setErrorMsg(null);
    try {
      await deleteAttachmentApi(ticketDetail.id, attachment.id);
      setAttachment(null);
    } catch (err: any) {
      setErrorMsg('Failed to delete file.');
    }
  };

  // Utilities
  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toString().includes(searchQuery) ||
      (t.createdBy?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'OPEN': return '#ef4444';
      case 'IN_PROGRESS': return '#f59e0b';
      case 'RESOLVED': return '#3b82f6';
      case 'CLOSED': return '#64748b';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#d97706';
      case 'LOW': return '#16a34a';
    }
  };

  const getNextStatuses = (currentStatus: Status): Status[] => {
    switch (currentStatus) {
      case 'OPEN': return ['IN_PROGRESS'];
      case 'IN_PROGRESS': return ['RESOLVED'];
      case 'RESOLVED': return ['CLOSED', 'IN_PROGRESS'];
      case 'CLOSED': return [];
      default: return [];
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const isTicketClosed = ticketDetail?.status === 'CLOSED';

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* LEFT COLUMN: Ticket List Panel (~380px) */}
      <Box
        sx={{
          width: { xs: '100%', md: 380 },
          minWidth: { xs: '100%', md: 380 },
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: isDark ? '#151c2c' : '#ffffff',
          borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
        }}
      >
        {/* Search & Header */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Tickets ({filteredTickets.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Refresh Tickets">
                <IconButton size="small" onClick={fetchTickets}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => navigate('/tickets/new')}
                sx={{ backgroundColor: '#0284c7', fontSize: '0.75rem', px: 1.5 }}
              >
                New
              </Button>
            </Box>
          </Box>

          {/* Quick Search Input */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search tickets by ID, title, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: isDark ? '#94a3b8' : '#64748b' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 1.5 }}
          />

          {/* Compact Filter Dropdowns */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" fullWidth>
              <Select
                displayEmpty
                value={statusFilter}
                onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value as Status | '')}
                sx={{ fontSize: '0.75rem', height: 32 }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="OPEN">OPEN</MenuItem>
                <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                <MenuItem value="RESOLVED">RESOLVED</MenuItem>
                <MenuItem value="CLOSED">CLOSED</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <Select
                displayEmpty
                value={priorityFilter}
                onChange={(e: SelectChangeEvent) => setPriorityFilter(e.target.value as Priority | '')}
                sx={{ fontSize: '0.75rem', height: 32 }}
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="CRITICAL">CRITICAL</MenuItem>
                <MenuItem value="HIGH">HIGH</MenuItem>
                <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                <MenuItem value="LOW">LOW</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <Select
                displayEmpty
                value={categoryFilter}
                onChange={(e: SelectChangeEvent) => setCategoryFilter(e.target.value as Category | '')}
                sx={{ fontSize: '0.75rem', height: 32 }}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="HARDWARE">HARDWARE</MenuItem>
                <MenuItem value="SOFTWARE">SOFTWARE</MenuItem>
                <MenuItem value="NETWORK">NETWORK</MenuItem>
                <MenuItem value="ACCESS">ACCESS</MenuItem>
                <MenuItem value="OTHER">OTHER</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Scrollable Ticket List */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {loadingList ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={32} sx={{ color: '#0284c7' }} />
            </Box>
          ) : filteredTickets.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                No tickets found matching filters.
              </Typography>
            </Box>
          ) : (
            filteredTickets.map((ticket) => {
              const isSelected = ticket.id === selectedTicketId;
              const statusColor = getStatusColor(ticket.status);
              const priorityColor = getPriorityColor(ticket.priority);

              return (
                <Box
                  key={ticket.id}
                  onClick={() => handleSelectTicket(ticket.id)}
                  sx={{
                    p: 1.75,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'}`,
                    borderLeft: isSelected ? '4px solid #0284c7' : '4px solid transparent',
                    backgroundColor: isSelected
                      ? (isDark ? 'rgba(2, 132, 199, 0.15)' : 'rgba(2, 132, 199, 0.06)')
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: isSelected
                        ? (isDark ? 'rgba(2, 132, 199, 0.18)' : 'rgba(2, 132, 199, 0.08)')
                        : (isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc'),
                    },
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Requester Avatar Circle */}
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      bgcolor: isDark ? '#334155' : '#cbd5e1',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  >
                    {getInitials(ticket.createdBy?.username)}
                  </Avatar>

                  {/* Title & Metadata Stack */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{
                        fontWeight: isSelected ? 700 : 600,
                        color: isDark ? '#f8fafc' : '#0f172a',
                        fontSize: '0.84rem',
                      }}
                    >
                      #{ticket.id} — {ticket.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      {ticket.createdBy?.username || 'User'} • {formatRelativeTime(ticket.createdAt)}
                    </Typography>
                  </Box>

                  {/* Priority Indicator & Status Chip */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: priorityColor }} />
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 800, color: priorityColor }}>
                        {ticket.priority}
                      </Typography>
                    </Box>
                    <Chip
                      label={ticket.status}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        bgcolor: `${statusColor}20`,
                        color: statusColor,
                        border: `1px solid ${statusColor}40`,
                      }}
                    />
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {/* RIGHT COLUMN: Ticket Detail Workspace (Flex 1) */}
      <Box
        sx={{
          flex: 1,
          height: '100vh',
          overflowY: 'auto',
          backgroundColor: isDark ? '#0b0f19' : '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {loadingDetail ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress sx={{ color: '#0284c7' }} />
          </Box>
        ) : ticketDetail ? (
          <>
            {/* Ticket Header Toolbar */}
            <Box
              sx={{
                p: 2.5,
                px: 4,
                backgroundColor: isDark ? '#151c2c' : '#ffffff',
                borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  #{ticketDetail.id} — {ticketDetail.title}
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', mt: 0.5, display: 'block' }}>
                  Reported by <strong style={{ color: isDark ? '#38bdf8' : '#0284c7' }}>{ticketDetail.createdBy?.username}</strong> on {new Date(ticketDetail.createdAt).toLocaleString()}
                </Typography>
              </Box>

              {/* Status Control Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {canEditStatus ? (
                  getNextStatuses(ticketDetail.status).length > 0 ? (
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel id="advance-status-label">Advance Status</InputLabel>
                      <Select
                        labelId="advance-status-label"
                        value=""
                        label="Advance Status"
                        onChange={(e) => handleStatusChange(e.target.value as Status)}
                        sx={{ height: 36, fontSize: '0.8rem' }}
                      >
                        {getNextStatuses(ticketDetail.status).map((st) => (
                          <MenuItem key={st} value={st}>Advance to {st}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Chip label="Ticket Closed (Terminal)" color="default" sx={{ fontWeight: 700 }} />
                  )
                ) : (
                  <Chip label={`Status: ${ticketDetail.status}`} color="primary" sx={{ fontWeight: 700 }} />
                )}
              </Box>
            </Box>

            {errorMsg && <Alert severity="error" sx={{ m: 3, mb: 0 }}>{errorMsg}</Alert>}
            {successMsg && <Alert severity="success" sx={{ m: 3, mb: 0 }}>{successMsg}</Alert>}

            {/* Split Inner Workspace: Feed (Left) & Sidebar (Right) */}
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Main Discussion Feed Area (70%) */}
              <Box sx={{ flex: 1, p: 4, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Ticket Description Post */}
                <Card
                  elevation={1}
                  sx={{
                    backgroundColor: isDark ? '#151c2c' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, mb: 1 }}>
                      ORIGINAL TICKET ISSUE DESCRIPTION
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: isDark ? '#e2e8f0' : '#334155',
                        whiteSpace: 'pre-line',
                        lineHeight: 1.65,
                      }}
                    >
                      {ticketDetail.description || 'No detailed description provided.'}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Discussion Feed */}
                <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', mt: 1 }}>
                  Conversation Thread ({comments.length})
                </Typography>

                {comments.length === 0 ? (
                  <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontStyle: 'italic' }}>
                    No responses or notes posted yet.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {comments.map((c) => (
                      <Paper
                        key={c.id}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          backgroundColor: isDark ? '#151c2c' : '#ffffff',
                          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                          borderRadius: 2.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 26, height: 26, fontSize: '0.7rem', bgcolor: '#0284c7' }}>
                              {getInitials(c.author?.username)}
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#38bdf8' : '#0284c7' }}>
                              {c.author?.username || 'User'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                            {new Date(c.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: isDark ? '#f8fafc' : '#0f172a', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                          {c.body}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}

                {/* Inline Comment Box */}
                {isTicketClosed ? (
                  <Alert severity="info" icon={<LockIcon />}>
                    Discussion is locked because this ticket is CLOSED.
                  </Alert>
                ) : (
                  <Box component="form" onSubmit={handleAddComment} sx={{ mt: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Write a response or update notes..."
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      sx={{ mb: 1.5 }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SendIcon />}
                      disabled={submittingComment || !commentBody.trim()}
                      sx={{ backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 700 }}
                    >
                      Post Response
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Right Properties Sidebar (~280px) */}
              <Box
                sx={{
                  width: 300,
                  minWidth: 300,
                  p: 3,
                  backgroundColor: isDark ? '#151c2c' : '#ffffff',
                  borderLeft: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  overflowY: 'auto',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  Properties Sidebar
                </Typography>
                <Divider sx={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>Status:</Typography>
                    <Chip label={ticketDetail.status} size="small" sx={{ fontWeight: 800 }} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>Priority:</Typography>
                    <Chip label={ticketDetail.priority} size="small" color="warning" sx={{ fontWeight: 800 }} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>Category:</Typography>
                    <Chip label={ticketDetail.category} size="small" variant="outlined" color="primary" sx={{ fontWeight: 700 }} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>Created By:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#38bdf8' : '#0284c7' }}>
                      {ticketDetail.createdBy?.username}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>Created At:</Typography>
                    <Typography variant="caption" sx={{ color: isDark ? '#f8fafc' : '#0f172a', display: 'block' }}>
                      {new Date(ticketDetail.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0' }} />

                {/* Attachment Section */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  File Attachment
                </Typography>

                {attachment ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AttachFileIcon fontSize="small" sx={{ color: '#0284c7' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', display: 'block' }} noWrap>
                        {attachment.originalFileName}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        component="a"
                        href={getAttachmentDownloadUrl(ticketDetail.id, attachment.id)}
                        download
                        sx={{ flex: 1, fontSize: '0.7rem' }}
                      >
                        Download
                      </Button>
                      {!isTicketClosed && (
                        <IconButton size="small" color="error" onClick={handleDeleteFile}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Paper>
                ) : (
                  <Box>
                    <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', mb: 1.5 }}>
                      No attachment present.
                    </Typography>
                    {!isTicketClosed && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {selectedFile ? selectedFile.name : 'Choose File'}
                          <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                        </Button>
                        {selectedFile && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleUploadFile}
                            disabled={uploadingFile}
                            sx={{ backgroundColor: '#0284c7', fontSize: '0.75rem' }}
                          >
                            {uploadingFile ? 'Uploading...' : 'Upload'}
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Typography variant="body1" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              Select a ticket from the left panel to view details.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
