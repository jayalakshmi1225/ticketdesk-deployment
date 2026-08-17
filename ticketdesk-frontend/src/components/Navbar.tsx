import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Container,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../context/ColorModeContext';

export const Navbar: React.FC = () => {
  const { isAuthenticated, username, role, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const isDark = mode === 'dark';

  return (
    <AppBar
      position="sticky"
      elevation={3}
      sx={{
        width: '100%',
        background: isDark
          ? 'linear-gradient(135deg, #151c2c 0%, #0b0f19 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
        borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
        color: isDark ? '#f8fafc' : '#0f172a',
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        <Toolbar disableGutters sx={{ minHeight: 68, display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo & Brand */}
          <Box
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: 4 }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
              }}
            >
              <ConfirmationNumberIcon sx={{ color: '#ffffff', fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 800,
                letterSpacing: '.03rem',
                color: isDark ? '#f8fafc' : '#0f172a',
                fontFamily: 'Outfit, Inter, sans-serif',
              }}
            >
              TicketDesk
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <Button
              startIcon={<ConfirmationNumberIcon />}
              onClick={() => navigate('/')}
              sx={{
                color: location.pathname === '/' || (location.pathname.startsWith('/tickets') && location.pathname !== '/tickets/new')
                  ? (isDark ? '#38bdf8' : '#0284c7')
                  : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: 700,
                px: 2,
                borderBottom: location.pathname === '/' || (location.pathname.startsWith('/tickets') && location.pathname !== '/tickets/new')
                  ? `2px solid ${isDark ? '#38bdf8' : '#0284c7'}`
                  : '2px solid transparent',
                borderRadius: 0,
              }}
            >
              Tickets
            </Button>
            <Button
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{
                color: location.pathname === '/dashboard'
                  ? (isDark ? '#38bdf8' : '#0284c7')
                  : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: 700,
                px: 2,
                borderBottom: location.pathname === '/dashboard'
                  ? `2px solid ${isDark ? '#38bdf8' : '#0284c7'}`
                  : '2px solid transparent',
                borderRadius: 0,
              }}
            >
              Dashboard
            </Button>
          </Box>

          {/* Right Action Items: Dark/Light Mode Toggle + Profile + Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {/* Theme Switcher Button */}
            <Tooltip title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}>
              <IconButton
                onClick={toggleColorMode}
                sx={{
                  color: isDark ? '#fbbf24' : '#64748b',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* Profile Info Chip */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
                px: 2,
                py: 0.75,
                borderRadius: 2.5,
              }}
            >
              <AccountCircleIcon sx={{ color: isDark ? '#38bdf8' : '#0284c7' }} />
              <Typography variant="body2" sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700 }}>
                {username}
              </Typography>
              {role && (
                <Chip
                  label={role}
                  size="small"
                  color={role === 'ADMIN' ? 'error' : role === 'AGENT' ? 'warning' : 'info'}
                  sx={{ height: 22, fontSize: '0.7rem', fontWeight: 800 }}
                />
              )}
            </Box>

            {/* Logout Button */}
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ textTransform: 'none', fontWeight: 700, px: 2, borderRadius: 2 }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
