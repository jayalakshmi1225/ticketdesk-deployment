import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  MenuItem,
} from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate } from 'react-router-dom';
import { loginApi, registerApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../context/ColorModeContext';
import type { Role } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const LoginPage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('USER');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { setAuthData } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const isDark = mode === 'dark';
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await loginApi({ username: loginUsername, password: loginPassword });
      setAuthData(res);
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrorMsg('Invalid username or password.');
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await registerApi({ username: regUsername, password: regPassword, role: regRole });
      setSuccessMsg('Registration successful! Please sign in with your credentials.');
      setTabIndex(0);
      setLoginUsername(regUsername);
      setLoginPassword('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Username may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark
          ? 'radial-gradient(circle at 50% 30%, #1e293b 0%, #0b0f19 100%)'
          : 'radial-gradient(circle at 50% 30%, #e2e8f0 0%, #f8fafc 100%)',
        py: 6,
        px: 2,
        position: 'relative',
      }}
    >
      {/* Theme Toggle Button on Top Right */}
      <Tooltip title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}>
        <IconButton
          onClick={toggleColorMode}
          sx={{
            position: 'absolute',
            top: 24,
            right: 24,
            color: isDark ? '#fbbf24' : '#64748b',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
          }}
        >
          {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>

      <Container maxWidth="xs">
        <Card
          elevation={8}
          sx={{
            background: isDark ? '#151c2c' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 8px 20px rgba(56, 189, 248, 0.4)',
                }}
              >
                <ConfirmationNumberIcon sx={{ color: '#ffffff', fontSize: 32 }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: isDark ? '#f8fafc' : '#0f172a',
                  fontFamily: 'Outfit, Inter, sans-serif',
                }}
              >
                TicketDesk Portal
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b', mt: 0.5 }}>
                IT Support Ticket Management Platform
              </Typography>
            </Box>

            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

            {/* Tabs */}
            <Tabs
              value={tabIndex}
              onChange={(_, val) => {
                setTabIndex(val);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0' }}
            >
              <Tab label="Sign In" icon={<LoginIcon />} iconPosition="start" />
              <Tab label="Register" icon={<PersonAddIcon />} iconPosition="start" />
            </Tabs>

            {/* Sign In Tab */}
            <CustomTabPanel value={tabIndex} index={0}>
              <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Username"
                  placeholder="Enter your username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    py: 1.3,
                    mt: 1,
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                    '&:hover': { backgroundColor: '#0369a1' },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>
              </Box>
            </CustomTabPanel>

            {/* Register Tab */}
            <CustomTabPanel value={tabIndex} index={1}>
              <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Username"
                  placeholder="Choose a username"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Password"
                  type="password"
                  placeholder="Choose a strong password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  select
                  label="Account Role"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as Role)}
                  fullWidth
                >
                  <MenuItem value="USER">USER (Regular User)</MenuItem>
                  <MenuItem value="AGENT">AGENT (Support Specialist)</MenuItem>
                  <MenuItem value="ADMIN">ADMIN (System Administrator)</MenuItem>
                </TextField>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    py: 1.3,
                    mt: 1,
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                    '&:hover': { backgroundColor: '#0369a1' },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </Button>
              </Box>
            </CustomTabPanel>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
