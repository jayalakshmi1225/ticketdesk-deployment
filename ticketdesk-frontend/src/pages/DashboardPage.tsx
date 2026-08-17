import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  IconButton,
  Skeleton,
  Chip,
  Tooltip as MuiTooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PieChartIcon from '@mui/icons-material/PieChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getDashboardSummaryApi } from '../api/dashboard';
import type { DashboardSummaryDto } from '../types/ticket';
import { useColorMode } from '../context/ColorModeContext';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  const fetchSummary = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getDashboardSummaryApi();
      setSummary(data);
    } catch (err: any) {
      setErrorMsg('Failed to load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Format status data for recharts BarChart
  const statusChartData = summary
    ? [
        { name: 'OPEN', count: summary.countsByStatus.OPEN || 0, color: '#ef4444' },
        { name: 'IN_PROGRESS', count: summary.countsByStatus.IN_PROGRESS || 0, color: '#f59e0b' },
        { name: 'RESOLVED', count: summary.countsByStatus.RESOLVED || 0, color: '#3b82f6' },
        { name: 'CLOSED', count: summary.countsByStatus.CLOSED || 0, color: '#64748b' },
      ]
    : [];

  // Format priority data for recharts BarChart
  const priorityChartData = summary
    ? [
        { name: 'LOW', count: summary.countsByPriority.LOW || 0, color: '#10b981' },
        { name: 'MEDIUM', count: summary.countsByPriority.MEDIUM || 0, color: '#3b82f6' },
        { name: 'HIGH', count: summary.countsByPriority.HIGH || 0, color: '#f59e0b' },
        { name: 'CRITICAL', count: summary.countsByPriority.CRITICAL || 0, color: '#ef4444' },
      ]
    : [];

  const hasSlaWarning = summary ? summary.openOlderThan48h > 0 : false;

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 }, width: '100%', flex: 1 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
            Operations Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: isDark ? '#94a3b8' : '#64748b', mt: 0.5 }}>
            Real-time ticket volume metrics, priority distribution, and SLA warnings
          </Typography>
        </Box>
        <MuiTooltip title="Refresh Metrics">
          <IconButton
            onClick={fetchSummary}
            disabled={loading}
            sx={{
              color: isDark ? '#38bdf8' : '#0284c7',
              border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
              backgroundColor: isDark ? '#151c2c' : '#ffffff',
            }}
          >
            <RefreshIcon />
          </IconButton>
        </MuiTooltip>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

      {/* Loading Skeleton State */}
      {loading ? (
        <Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" height={130} sx={{ bgcolor: isDark ? '#151c2c' : '#e2e8f0', borderRadius: 3 }} />
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
            <Skeleton variant="rounded" height={360} sx={{ bgcolor: isDark ? '#151c2c' : '#e2e8f0', borderRadius: 3 }} />
            <Skeleton variant="rounded" height={360} sx={{ bgcolor: isDark ? '#151c2c' : '#e2e8f0', borderRadius: 3 }} />
          </Box>
        </Box>
      ) : summary ? (
        <>
          {/* Top Big-Number Stat Cards (Full Width Grid) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
            {/* Total Tickets Card */}
            <Card
              elevation={2}
              sx={{
                background: isDark ? '#151c2c' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700 }}>
                      Total Tickets
                    </Typography>
                    <Typography variant="h3" sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, mt: 1 }}>
                      {summary.totalTickets}
                    </Typography>
                  </Box>
                  <ConfirmationNumberIcon sx={{ color: isDark ? '#38bdf8' : '#0284c7', fontSize: 48 }} />
                </Box>
              </CardContent>
            </Card>

            {/* SLA Warning Card */}
            <Card
              elevation={2}
              sx={{
                background: hasSlaWarning ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2') : (isDark ? '#151c2c' : '#ffffff'),
                border: hasSlaWarning ? '2px solid #ef4444' : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: hasSlaWarning ? '#ef4444' : (isDark ? '#94a3b8' : '#64748b'), fontWeight: 700 }}>
                      Open &gt; 48 Hours SLA Breach
                    </Typography>
                    <Typography variant="h3" sx={{ color: hasSlaWarning ? '#ef4444' : (isDark ? '#f8fafc' : '#0f172a'), fontWeight: 800, mt: 1 }}>
                      {summary.openOlderThan48h}
                    </Typography>
                  </Box>
                  <WarningAmberIcon sx={{ color: hasSlaWarning ? '#ef4444' : '#94a3b8', fontSize: 48 }} />
                </Box>
              </CardContent>
            </Card>

            {/* Active Open Tickets Card */}
            <Card
              elevation={2}
              sx={{
                background: isDark ? '#151c2c' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700 }}>
                      Active Open Tickets
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 800, mt: 1 }}>
                      {summary.countsByStatus.OPEN || 0}
                    </Typography>
                  </Box>
                  <PieChartIcon sx={{ color: '#ef4444', fontSize: 48 }} />
                </Box>
              </CardContent>
            </Card>

            {/* Resolved & Closed Card */}
            <Card
              elevation={2}
              sx={{
                background: isDark ? '#151c2c' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700 }}>
                      Resolved & Closed
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 800, mt: 1 }}>
                      {(summary.countsByStatus.RESOLVED || 0) + (summary.countsByStatus.CLOSED || 0)}
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ color: '#10b981', fontSize: 48 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Recharts Bar Charts Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
            {/* Status Breakdown Bar Chart */}
            <Card
              elevation={2}
              sx={{
                background: isDark ? '#151c2c' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700, mb: 3 }}>
                  Status Volume Distribution
                </Typography>
                <Box sx={{ height: 280, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                      <YAxis allowDecimals={false} stroke={isDark ? '#94a3b8' : '#64748b'} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#0b0f19' : '#ffffff',
                          borderColor: isDark ? '#334155' : '#cbd5e1',
                          borderRadius: 8,
                          color: isDark ? '#f8fafc' : '#0f172a',
                        }}
                        cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)' }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-status-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, pt: 2, borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}` }}>
                  {statusChartData.map((s) => (
                    <Box key={s.name} sx={{ textAlign: 'center' }}>
                      <Chip label={s.name} size="small" sx={{ bgcolor: s.color, color: '#ffffff', fontWeight: 800, mb: 0.5 }} />
                      <Typography variant="h6" sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800 }}>{s.count}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Priority Breakdown Bar Chart */}
            <Card
              elevation={2}
              sx={{
                background: isDark ? '#151c2c' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700, mb: 3 }}>
                  Priority Volume Distribution
                </Typography>
                <Box sx={{ height: 280, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                      <YAxis allowDecimals={false} stroke={isDark ? '#94a3b8' : '#64748b'} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#0b0f19' : '#ffffff',
                          borderColor: isDark ? '#334155' : '#cbd5e1',
                          borderRadius: 8,
                          color: isDark ? '#f8fafc' : '#0f172a',
                        }}
                        cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)' }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {priorityChartData.map((entry, index) => (
                          <Cell key={`cell-priority-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, pt: 2, borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}` }}>
                  {priorityChartData.map((p) => (
                    <Box key={p.name} sx={{ textAlign: 'center' }}>
                      <Chip label={p.name} size="small" sx={{ bgcolor: p.color, color: '#ffffff', fontWeight: 800, mb: 0.5 }} />
                      <Typography variant="h6" sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800 }}>{p.count}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </>
      ) : null}
    </Container>
  );
};
