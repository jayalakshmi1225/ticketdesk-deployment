import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
} from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../context/ColorModeContext';

export const NavRail: React.FC = () => {
  const { isAuthenticated, username, role, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const isDark = mode === 'dark';
  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Box
      sx={{
        width: 64,
        minWidth: 64,
        height: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        px: 1,
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 1200,
        userSelect: 'none',
      }}
    >
      {/* App Logo */}
      <Tooltip title="TicketDesk Helpdesk" placement="right">
        <Box
          onClick={() => navigate('/')}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
            mb: 3,
          }}
        >
          <ConfirmationNumberIcon sx={{ color: '#ffffff', fontSize: 24 }} />
        </Box>
      </Tooltip>

      {/* Primary Navigation Icons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, width: '100%', alignItems: 'center' }}>
        {/* Tickets Workspace */}
        <Tooltip title="Tickets Workspace" placement="right">
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              color: currentPath === '/' || (currentPath.startsWith('/tickets') && currentPath !== '/tickets/new')
                ? '#ffffff'
                : '#94a3b8',
              backgroundColor: currentPath === '/' || (currentPath.startsWith('/tickets') && currentPath !== '/tickets/new')
                ? '#0284c7'
                : 'transparent',
              '&:hover': {
                backgroundColor: currentPath === '/' || (currentPath.startsWith('/tickets') && currentPath !== '/tickets/new')
                  ? '#0369a1'
                  : 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <ConfirmationNumberIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Dashboard */}
        <Tooltip title="Operations Dashboard" placement="right">
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              color: currentPath === '/dashboard' ? '#ffffff' : '#94a3b8',
              backgroundColor: currentPath === '/dashboard' ? '#0284c7' : 'transparent',
              '&:hover': {
                backgroundColor: currentPath === '/dashboard' ? '#0369a1' : 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <DashboardIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Create Ticket */}
        <Tooltip title="Create New Ticket" placement="right">
          <IconButton
            onClick={() => navigate('/tickets/new')}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              color: currentPath === '/tickets/new' ? '#ffffff' : '#38bdf8',
              backgroundColor: currentPath === '/tickets/new' ? '#0284c7' : 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              '&:hover': {
                backgroundColor: currentPath === '/tickets/new' ? '#0369a1' : 'rgba(56, 189, 248, 0.2)',
              },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Bottom Controls: User Avatar, Theme Switcher & Logout */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center', width: '100%' }}>
        {/* User Info Avatar */}
        <Tooltip title={`${username} (${role || 'USER'})`} placement="right">
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: '0.75rem',
              fontWeight: 700,
              bgcolor: role === 'ADMIN' ? '#ef4444' : role === 'AGENT' ? '#f59e0b' : '#0284c7',
              color: '#ffffff',
            }}
          >
            {getInitials(username)}
          </Avatar>
        </Tooltip>

        <Divider sx={{ width: 32, borderColor: 'rgba(255, 255, 255, 0.1)', my: 0.5 }} />

        {/* Theme Mode Toggle */}
        <Tooltip title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`} placement="right">
          <IconButton
            onClick={toggleColorMode}
            sx={{
              width: 40,
              height: 40,
              color: isDark ? '#fbbf24' : '#94a3b8',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
            }}
          >
            {isDark ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* Logout Button */}
        <Tooltip title="Sign Out" placement="right">
          <IconButton
            onClick={handleLogout}
            sx={{
              width: 40,
              height: 40,
              color: '#f87171',
              '&:hover': { backgroundColor: 'rgba(248, 113, 113, 0.12)' },
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
