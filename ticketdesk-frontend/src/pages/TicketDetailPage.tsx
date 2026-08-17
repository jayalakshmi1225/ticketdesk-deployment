import React, { useEffect, useState } from 'react';
import {
  Container,
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketByIdApi, updateTicketStatusApi } from '../api/tickets';
import { getCommentsApi, createCommentApi } from '../api/comments';
import { getAttachmentsApi, uploadAttachmentApi, deleteAttachmentApi, getAttachmentDownloadUrl } from '../api/attachments';
import type { TicketDto, CommentDto, AttachmentDto, Status, Priority } from '../types/ticket';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../context/ColorModeContext';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);

  const [ticket, setTicket] = useState<TicketDto | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [attachment, setAttachment] = useState<AttachmentDto | null>(null);

  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState<string | null>(null);

  const { role } = useAuth();
  const { mode } = useColorMode();
  const isDark = mode === 'dark';
  const navigate = useNavigate();

  const canEditStatus = role === 'AGENT' || role === 'ADMIN';

  const loadData = async () => {
    if (!ticketId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const [ticketData, commentsData, attachmentsData] = await Promise.all([
        getTicketByIdApi(ticketId),
        getCommentsApi(ticketId),
        getAttachmentsApi(ticketId),
      ]);
      setTicket(ticketData);
      setComments(commentsData);
      setAttachment(attachmentsData.length > 0 ? attachmentsData[0] : null);
    } catch (err: any) {
      setErrorMsg('Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ticketId]);

  const handleStatusChange = async (newStatus: Status) => {
    if (!ticket) return;
    setErrorMsg(null);
    setStatusSuccessMsg(null);
    try {
      const updated = await updateTicketStatusApi(ticketId, { status: newStatus });
      setTicket(updated);
      setStatusSuccessMsg(`Status updated to ${newStatus}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setSubmittingComment(true);
    setErrorMsg(null);
    try {
      const newComment = await createCommentApi(ticketId, { body: commentBody });
      setComments((prev) => [...prev, newComment]);
      setCommentBody('');
    } catch (err: any) {
      setErrorMsg('Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      const newAttachment = await uploadAttachmentApi(ticketId, selectedFile);
      setAttachment(newAttachment);
      setSelectedFile(null);
    } catch (err: any) {
      setErrorMsg('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!attachment) return;
    setErrorMsg(null);
    try {
      await deleteAttachmentApi(ticketId, attachment.id);
      setAttachment(null);
    } catch (err: any) {
      setErrorMsg('Failed to delete file.');
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

  const getStatusChipColor = (status: Status) => {
    switch (status) {
      case 'OPEN': return 'error';
      case 'IN_PROGRESS': return 'warning';
      case 'RESOLVED': return 'info';
      case 'CLOSED': return 'default';
    }
  };

  const getPriorityChipColor = (priority: Priority) => {
    switch (priority) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress sx={{ color: '#38bdf8' }} />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">Ticket not found.</Alert>
      </Container>
    );
  }

  const allowedNextStatuses = getNextStatuses(ticket.status);
  const isTicketClosed = ticket.status === 'CLOSED';

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 }, width: '100%', flex: 1 }}>
      {/* Back Button & Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}
        >
          Back to Tickets
        </Button>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
      {statusSuccessMsg && <Alert severity="success" sx={{ mb: 3 }}>{statusSuccessMsg}</Alert>}

      {/* Responsive Grid Layout Spanning Full Viewport */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 4 }}>
        {/* Left Column: Title, Description, Status Workflow, Comments */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Main Details Card */}
          <Card
            elevation={2}
            sx={{
              background: isDark ? '#151c2c' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  #{ticket.id} — {ticket.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={ticket.priority} color={getPriorityChipColor(ticket.priority)} sx={{ fontWeight: 800 }} />
                  <Chip label={ticket.status} color={getStatusChipColor(ticket.status)} sx={{ fontWeight: 800 }} />
                </Box>
              </Box>

              <Divider sx={{ my: 2.5, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0' }} />

              <Typography variant="subtitle2" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, mb: 1 }}>
                DESCRIPTION
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: isDark ? '#e2e8f0' : '#334155',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.7,
                  fontSize: '1.05rem',
                }}
              >
                {ticket.description || 'No description provided.'}
              </Typography>

              <Divider sx={{ my: 3, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0' }} />

              {/* Workflow Status Selector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700 }}>
                  Workflow Status Control:
                </Typography>
                {canEditStatus ? (
                  allowedNextStatuses.length > 0 ? (
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel id="status-change-label">Advance Status</InputLabel>
                      <Select
                        labelId="status-change-label"
                        value=""
                        label="Advance Status"
                        onChange={(e) => handleStatusChange(e.target.value as Status)}
                      >
                        {allowedNextStatuses.map((st) => (
                          <MenuItem key={st} value={st}>Advance to {st}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Chip label="Ticket Closed (Terminal State)" color="default" sx={{ fontWeight: 700 }} />
                  )
                ) : (
                  <Chip label={`Read-only (${ticket.status})`} color="default" sx={{ fontWeight: 600 }} />
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Threaded Comments Section */}
          <Card
            elevation={2}
            sx={{
              background: isDark ? '#151c2c' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: isDark ? '#f8fafc' : '#0f172a' }}>
                Threaded Discussion ({comments.length})
              </Typography>

              {comments.length === 0 ? (
                <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontStyle: 'italic', mb: 3 }}>
                  No comments posted yet.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
                  {comments.map((c) => (
                    <Paper
                      key={c.id}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0'}`,
                        borderRadius: 2.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountCircleIcon sx={{ color: isDark ? '#38bdf8' : '#0284c7', fontSize: 20 }} />
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

              {/* Add Comment Box */}
              {isTicketClosed ? (
                <Alert severity="info" icon={<LockIcon />}>
                  Discussion is locked because this ticket is CLOSED.
                </Alert>
              ) : (
                <Box component="form" onSubmit={handleAddComment}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Write a response or add notes..."
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SendIcon />}
                    disabled={submittingComment || !commentBody.trim()}
                    sx={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      fontWeight: 700,
                      '&:hover': { backgroundColor: '#0369a1' },
                    }}
                  >
                    Post Comment
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Right Column: Metadata & File Attachments */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Metadata Card */}
          <Card
            elevation={2}
            sx={{
              background: isDark ? '#151c2c' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: isDark ? '#f8fafc' : '#0f172a' }}>
                Ticket Details
              </Typography>
              <Divider sx={{ mb: 2, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>Category:</Typography>
                  <Chip label={ticket.category} size="small" variant="outlined" color="primary" sx={{ fontWeight: 700 }} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>Created By:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#38bdf8' : '#0284c7' }}>
                    {ticket.createdBy?.username}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>Created Date:</Typography>
                  <Typography variant="body2" sx={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {new Date(ticket.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>Last Updated:</Typography>
                  <Typography variant="body2" sx={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Attachment Manager */}
          <Card
            elevation={2}
            sx={{
              background: isDark ? '#151c2c' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: isDark ? '#f8fafc' : '#0f172a' }}>
                Attachment Manager
              </Typography>
              <Divider sx={{ mb: 2, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0' }} />

              {attachment ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <AttachFileIcon sx={{ color: isDark ? '#38bdf8' : '#0284c7' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }} noWrap>
                      {attachment.originalFileName}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', mb: 2 }}>
                    Size: {(attachment.sizeBytes / 1024).toFixed(1)} KB • Uploaded by {attachment.uploadedBy?.username}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      component="a"
                      href={getAttachmentDownloadUrl(ticketId, attachment.id)}
                      download
                      sx={{ flex: 1, borderColor: '#0284c7', color: '#0284c7', fontWeight: 700 }}
                    >
                      Download
                    </Button>
                    {!isTicketClosed && (
                      <IconButton color="error" size="small" onClick={handleDeleteFile}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Paper>
              ) : (
                <Box>
                  <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b', mb: 2 }}>
                    No attachment uploaded for this ticket.
                  </Typography>

                  {!isTicketClosed && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{ borderColor: isDark ? '#334155' : '#cbd5e1', color: isDark ? '#f8fafc' : '#0f172a' }}
                      >
                        {selectedFile ? selectedFile.name : 'Select File'}
                        <input
                          type="file"
                          hidden
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                      </Button>
                      {selectedFile && (
                        <Button
                          variant="contained"
                          onClick={handleUploadFile}
                          disabled={uploading}
                          sx={{ backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 700 }}
                        >
                          {uploading ? 'Uploading...' : 'Upload Selected File'}
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};
