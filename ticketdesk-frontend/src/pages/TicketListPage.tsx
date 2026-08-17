import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  type SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
import { getTicketsApi } from '../api/tickets';
import type { TicketDto, Status, Priority, Category } from '../types/ticket';
import { useColorMode } from '../context/ColorModeContext';

export const TicketListPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('');

  const { mode } = useColorMode();
  const isDark = mode === 'dark';
  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getTicketsApi({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined,
      });
      setTickets(data);
    } catch (err: any) {
      setErrorMsg('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

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

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 }, width: '100%', flex: 1 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
            IT Support Tickets
          </Typography>
          <Typography variant="body1" sx={{ color: isDark ? '#94a3b8' : '#64748b', mt: 0.5 }}>
            View, filter, and manage technical support requests across the organization
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Refresh Ticket List">
            <IconButton
              onClick={fetchTickets}
              sx={{
                color: isDark ? '#94a3b8' : '#64748b',
                border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                backgroundColor: isDark ? '#151c2c' : '#ffffff',
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tickets/new')}
            sx={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontWeight: 700,
              px: 3,
              py: 1.2,
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              '&:hover': { backgroundColor: '#0369a1' },
            }}
          >
            New Ticket
          </Button>
        </Box>
      </Box>

      {/* Filter Bar */}
      <Card
        elevation={2}
        sx={{
          mb: 4,
          background: isDark ? '#151c2c' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
            <FilterListIcon sx={{ color: isDark ? '#38bdf8' : '#0284c7' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Filters:
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="status-filter-label" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              Status
            </InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value as Status | '')}
              sx={{ color: isDark ? '#f8fafc' : '#0f172a' }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="OPEN">OPEN</MenuItem>
              <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
              <MenuItem value="RESOLVED">RESOLVED</MenuItem>
              <MenuItem value="CLOSED">CLOSED</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="priority-filter-label" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              Priority
            </InputLabel>
            <Select
              labelId="priority-filter-label"
              id="priority-filter"
              value={priorityFilter}
              label="Priority"
              onChange={(e: SelectChangeEvent) => setPriorityFilter(e.target.value as Priority | '')}
              sx={{ color: isDark ? '#f8fafc' : '#0f172a' }}
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="CRITICAL">CRITICAL</MenuItem>
              <MenuItem value="HIGH">HIGH</MenuItem>
              <MenuItem value="MEDIUM">MEDIUM</MenuItem>
              <MenuItem value="LOW">LOW</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="category-filter-label" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              Category
            </InputLabel>
            <Select
              labelId="category-filter-label"
              id="category-filter"
              value={categoryFilter}
              label="Category"
              onChange={(e: SelectChangeEvent) => setCategoryFilter(e.target.value as Category | '')}
              sx={{ color: isDark ? '#f8fafc' : '#0f172a' }}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="HARDWARE">HARDWARE</MenuItem>
              <MenuItem value="SOFTWARE">SOFTWARE</MenuItem>
              <MenuItem value="NETWORK">NETWORK</MenuItem>
              <MenuItem value="ACCESS">ACCESS</MenuItem>
              <MenuItem value="OTHER">OTHER</MenuItem>
            </Select>
          </FormControl>

          {(statusFilter || priorityFilter || categoryFilter) && (
            <Button
              size="small"
              onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
                setCategoryFilter('');
              }}
              sx={{ color: isDark ? '#f87171' : '#ef4444', fontWeight: 600 }}
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

      {/* Main Table Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress sx={{ color: '#38bdf8' }} />
        </Box>
      ) : tickets.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 10,
            background: isDark ? '#151c2c' : '#ffffff',
            borderRadius: 3,
            border: `1px dashed ${isDark ? '#334155' : '#cbd5e1'}`,
          }}
        >
          <Typography variant="h6" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
            No support tickets found matching your criteria
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/tickets/new')}
            sx={{ mt: 2, borderColor: '#0284c7', color: '#0284c7' }}
          >
            Create First Ticket
          </Button>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            background: isDark ? '#151c2c' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
            borderRadius: 3,
            overflowX: 'auto',
          }}
        >
          <Table sx={{ width: '100%', minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, py: 2 }}>ID & Title</TableCell>
                <TableCell sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, py: 2 }}>Category</TableCell>
                <TableCell sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, py: 2 }}>Priority</TableCell>
                <TableCell sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, py: 2 }}>Status</TableCell>
                <TableCell sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, py: 2 }}>Created By</TableCell>
                <TableCell sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, py: 2 }}>Date Created</TableCell>
                <TableCell align="right" sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, py: 2 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(2, 132, 199, 0.04)',
                    },
                    '& td': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
                      py: 2,
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                      #{ticket.id} — {ticket.title}
                    </Typography>
                    <Typography variant="caption" noWrap sx={{ color: isDark ? '#94a3b8' : '#64748b', maxWidth: 360, display: 'block' }}>
                      {ticket.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={ticket.category} size="small" variant="outlined" color="primary" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={ticket.priority} size="small" color={getPriorityChipColor(ticket.priority)} sx={{ fontWeight: 800 }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={ticket.status} size="small" color={getStatusChipColor(ticket.status)} sx={{ fontWeight: 800 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#38bdf8' : '#0284c7' }}>
                      {ticket.createdBy?.username || 'User'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>
                    {new Date(ticket.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" sx={{ color: isDark ? '#38bdf8' : '#0284c7' }}>
                      <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};
