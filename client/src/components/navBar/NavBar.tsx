import React, { useEffect, useState, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  TextField,
  Paper,
  Divider,
  useTheme,
  Slide,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { ThemeToggleButton } from '../ThemeToggleButton';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { NavDrawerButton } from './NavDrawerButton';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { JoinCourseForm } from './JoinCourseForm';

interface NavBarProps {
  token: string | null;
  userId: string | null;
  onLogout: () => void;
  onJoinCourseAsStudent?: (courseId: string) => Promise<void>;
  onJoinCourseAsTeacher?: (courseId: string) => Promise<void>;
  isTeacher?: boolean;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function NavBar({
  token,
  userId,
  onLogout,
  onJoinCourseAsStudent,
  onJoinCourseAsTeacher,
  isTeacher,
  scrollContainerRef,
}: NavBarProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [joinCourseId, setJoinCourseId] = useState('');
  const [joinMode, setJoinMode] = useState<'student' | 'teacher' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const lastScrollTop = useRef(0);

  const open = Boolean(anchorEl);

  useEffect(() => {
    const el = scrollContainerRef?.current || window;
    const handleScroll = () => {
      const scrollTop = el === window ? window.scrollY : (el as HTMLElement).scrollTop;
      if (scrollTop > lastScrollTop.current + 15 && visible) setVisible(false);
      else if (scrollTop < lastScrollTop.current - 15 && !visible) setVisible(true);
      lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef, visible]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCourseId.trim()) {
      setError('Введіть ID курсу');
      return;
    }
    try {
      if (joinMode === 'student' && onJoinCourseAsStudent)
        await onJoinCourseAsStudent(joinCourseId);
      else if (joinMode === 'teacher' && onJoinCourseAsTeacher)
        await onJoinCourseAsTeacher(joinCourseId);
      setJoinCourseId('');
      setJoinMode(null);
      setError(null);
      setAnchorEl(null);
    } catch (err: any) {
      setError(err?.message || 'Помилка приєднання');
    }
  };

  const menuItems = [
    { label: 'Курси', to: '/courses', icon: <SchoolIcon /> },
    { label: 'Завдання', to: `/user-task/student/${userId}/accepted`, icon: <AssignmentTurnedInIcon /> },
  ];

  const NavButtons = (
    <>
      {token && menuItems.map(({ label, to, icon }) => (
        <Button
          key={to}
          component={RouterLink}
          to={to}
          variant={location.pathname.startsWith(to) ? 'outlined' : 'text'}
          color="inherit"
          startIcon={icon}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {label}
        </Button>
      ))}
    </>
  );

  return (
    <Slide direction="down" in={visible} timeout={400}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(10px)',
          background:
            theme.palette.mode === 'light'
              ? 'rgba(255,255,255,0.85)'
              : 'rgba(25,25,28,0.85)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[2],
          transition: 'all 0.4s ease',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <SchoolIcon sx={{ color: theme.palette.primary.main, fontSize: 30 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.6,
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => navigate('/courses')}
            >
              LMS
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {NavButtons}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ThemeToggleButton />

            {token ? (
              <>
                {!isMobile && (
                  <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      color: '#fff',
                      width: 42,
                      height: 42,
                      '&:hover': {
                        bgcolor: theme.palette.secondary.dark,
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.25s',
                    }}
                  >
                    <PersonIcon />
                  </IconButton>
                )}
                {isMobile && (
                  <IconButton
                    onClick={() => setDrawerOpen(true)}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  color="secondary"
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    ...(isMobile && {
                      fontSize: '0.7rem',
                      padding: '4px 8px',
                      minWidth: 'unset',
                    }),
                  }}
                >
                  Увійти
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  color="secondary"
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    ...(isMobile && {
                      fontSize: '0.7rem',
                      padding: '4px 8px',
                      minWidth: 'unset',
                    }),
                  }}
                >
                  Реєстрація
                </Button>
              </>
            )}
          </Box>
        </Toolbar>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          sx={{ mt: 3 }}
          slotProps={{
            paper: {
              sx: (theme) => ({
                background:
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(30deg, rgba(66,165,245,0.9), rgba(236,108,246,0.55))'
                    : 'linear-gradient(30deg, rgba(66,165,245,0.1), rgba(236,108,246,0.25))',
                backdropFilter: 'blur(12px)',
                borderRadius: 3,
                boxShadow: theme.shadows[6],
              }),
            },
          }}
        >
          <MenuItem onClick={() => setJoinMode(joinMode === 'student' ? null : 'student')}>
            Приєднатися як студент
          </MenuItem>
          {isTeacher && (
            <MenuItem onClick={() => setJoinMode(joinMode === 'teacher' ? null : 'teacher')}>
              Приєднатися як викладач
            </MenuItem>
          )}
          <Divider sx={{ my: 1 }} />
          <MenuItem
            onClick={() => {
              onLogout();
              setAnchorEl(null);
            }}
            sx={{
              color: 'error.main',
              fontWeight: 600,
              justifyContent: 'center',
            }}
          >
            Вийти
          </MenuItem>

          {joinMode && (
            <JoinCourseForm
              joinCourseId={joinCourseId}
              error={error}
              onChange={setJoinCourseId}
              onSubmit={handleJoin}
            />
          )}
        </Menu>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: '70%',
              maxWidth: 320,
              background:
                theme.palette.mode === 'light'
                  ? 'rgba(255,255,255,0.97)'
                  : 'rgba(25,25,28,0.95)',
              color: theme.palette.text.primary,
              backdropFilter: 'blur(8px)',
              p: 2,
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Меню
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon sx={{ color: theme.palette.text.primary }} />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <NavDrawerButton
              to="/courses"
              label="Курси"
              icon={<SchoolIcon fontSize="small" />}
              onClose={() => setDrawerOpen(false)}
            />
            <NavDrawerButton
              to={`/user-task/student/${userId}/accepted`}
              label="Завдання"
              icon={<AssignmentTurnedInIcon fontSize="small" />}
              onClose={() => setDrawerOpen(false)}
            />

            <Box sx={{ my: 1, borderBottom: `1px solid ${theme.palette.divider}` }} />

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              sx={{ mt: 3 }}
              slotProps={{
                paper: {
                  sx: (theme) => ({
                    background:
                      theme.palette.mode === 'light'
                        ? 'linear-gradient(30deg, rgba(66,165,245,0.9), rgba(236,108,246,0.55))'
                        : 'linear-gradient(30deg, rgba(66,165,245,0.1), rgba(236,108,246,0.25))',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 3,
                    boxShadow: theme.shadows[6],
                  }),
                },
              }}
            >
              <MenuItem onClick={() => setJoinMode(joinMode === 'student' ? null : 'student')}>
                Приєднатися як студент
              </MenuItem>
              {isTeacher && (
                <MenuItem onClick={() => setJoinMode(joinMode === 'teacher' ? null : 'teacher')}>
                  Приєднатися як викладач
                </MenuItem>
              )}
              <Divider sx={{ my: 1 }} />
              <MenuItem
                onClick={() => {
                  onLogout();
                  setAnchorEl(null);
                }}
                sx={{
                  color: 'error.main',
                  fontWeight: 600,
                  justifyContent: 'center',
                }}
              >
                Вийти
              </MenuItem>

              {joinMode && (
                <JoinCourseForm
                  joinCourseId={joinCourseId}
                  error={error}
                  onChange={setJoinCourseId}
                  onSubmit={handleJoin}
                />
              )}
            </Menu>
            <NavDrawerButton
              to="/login"
              label="Вийти"
              icon={<ExitToAppIcon fontSize="small" />}
              onClose={() => {
                onLogout();
                setDrawerOpen(false);
              }}
            />
          </Box>
        </Drawer>
      </AppBar>
    </Slide>
  );
}
