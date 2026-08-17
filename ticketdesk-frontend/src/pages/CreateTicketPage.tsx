import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createTicketApi } from '../api/tickets';
import type { CreateTicketRequest } from '../types/ticket';
import { useColorMode } from '../context/ColorModeContext';

export const CreateTicketPage: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mode } = useColorMode();
  const isDark = mode === 'dark';
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketRequest>({
    defaultValues: {
      title: '',
      description: '',
      category: 'HARDWARE',
      priority: 'MEDIUM',
    },
  });

  const onSubmit = async (data: CreateTicketRequest) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const newTicket = await createTicketApi(data);
      navigate(`/tickets/${newTicket.id}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create support ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 5, px: { xs: 2, sm: 4, md: 6 }, width: '100%', flex: 1, maxWidth: 1000, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, mb: 3 }}
      >
        Back to Ticket List
      </Button>

      <Card
        elevation={3}
        sx={{
          background: isDark ? '#151c2c' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', mb: 1 }}>
            Create New Support Ticket
          </Typography>
          <Typography variant="body1" sx={{ color: isDark ? '#94a3b8' : '#64748b', mb: 4 }}>
            Submit a technical request to the IT helpdesk. Our support engineering team will respond shortly.
          </Typography>

          {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Title */}
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Ticket title is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ticket Title"
                  placeholder="e.g. VPN Connection drops frequently on Wi-Fi"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  fullWidth
                />
              )}
            />

            {/* Category & Priority Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel id="create-category-label">Category</InputLabel>
                    <Select
                      {...field}
                      labelId="create-category-label"
                      label="Category"
                    >
                      <MenuItem value="HARDWARE">HARDWARE</MenuItem>
                      <MenuItem value="SOFTWARE">SOFTWARE</MenuItem>
                      <MenuItem value="NETWORK">NETWORK</MenuItem>
                      <MenuItem value="ACCESS">ACCESS</MenuItem>
                      <MenuItem value="OTHER">OTHER</MenuItem>
                    </Select>
                    {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                name="priority"
                control={control}
                rules={{ required: 'Priority is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.priority}>
                    <InputLabel id="create-priority-label">Priority</InputLabel>
                    <Select
                      {...field}
                      labelId="create-priority-label"
                      label="Priority"
                    >
                      <MenuItem value="LOW">LOW</MenuItem>
                      <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                      <MenuItem value="HIGH">HIGH</MenuItem>
                      <MenuItem value="CRITICAL">CRITICAL</MenuItem>
                    </Select>
                    {errors.priority && <FormHelperText>{errors.priority.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>

            {/* Description */}
            <Controller
              name="description"
              control={control}
              rules={{ required: 'Description is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Detailed Description"
                  placeholder="Provide step-by-step details, error messages, or context..."
                  multiline
                  rows={6}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  fullWidth
                />
              )}
            />

            {/* Form Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                sx={{ borderColor: isDark ? '#334155' : '#cbd5e1', color: isDark ? '#f8fafc' : '#0f172a' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                disabled={submitting}
                sx={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 700,
                  px: 4,
                  py: 1.2,
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                  '&:hover': { backgroundColor: '#0369a1' },
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};
