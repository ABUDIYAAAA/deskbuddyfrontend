import React, { useState, useLayoutEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { MdDashboard, MdHotel, MdAssignment, MdInventory2 } from 'react-icons/md';
import { FiLogOut, FiUser, FiHome, FiCheckSquare, FiFileText, FiBox, FiSend, FiMenu, FiX } from 'react-icons/fi';
import avatar from '../assets/avitar.webp';
import '../styles/NewSidebar.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastProvider';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: <MdDashboard /> },
  // { to: '/arrival', label: 'Arrival', icon: <FiCheckSquare /> },
  { to: '/hostel', label: 'Hostel', icon: <MdHotel /> },
  // { to: '/documents', label: 'Documents', icon: <FiFileText /> },
  // { to: '/kit', label: 'Kit', icon: <MdInventory2 /> },
  { to: '/sendqr', label: 'Send QR', icon: <FiSend /> },
  // { to: '/analytics', label: 'Analytics', icon: <MdAssignment /> },
];

export default function NewSidebar({ onCollapseChange, mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Add/remove sidebar-expanded class to .scanner-container for margin
  useLayoutEffect(() => {
    const main = document.querySelector('.scanner-container');
    if (main) {
      if (!collapsed) {
        main.classList.add('sidebar-expanded');
      } else {
        main.classList.remove('sidebar-expanded');
      }
    }
  }, [collapsed]);

  const getUserName = () => {
    if (!user) return '';
    if (user.displayName) return user.displayName.split(' ')[0];
    if (user.email) return user.email.split('@')[0];
    return 'Volunteer';
  };

  // Notify parent of collapse state
  React.useEffect(() => {
    if (onCollapseChange) onCollapseChange(collapsed);
  }, [collapsed, onCollapseChange]);

  // Remove hover logic for mobile
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches;

  // Sidebar open/close logic
  React.useEffect(() => {
    if (isMobile && mobileOpen) setCollapsed(false);
    else if (isMobile && !mobileOpen) setCollapsed(true);
  }, [isMobile, mobileOpen]);

  const handleSidebarClose = () => {
    if (isMobile && setMobileOpen) setMobileOpen(false);
    else setCollapsed(true);
  };

  // Close sidebar on outside click (mobile only)
  React.useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const handleClick = (e) => {
      if (!e.target.closest('.new-sidebar')) setMobileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen, isMobile, setMobileOpen]);

  return (
    <>
      {/* Hamburger for mobile, shown in header by parent */}
      {/* Sidebar overlay for mobile */}
      {isMobile && mobileOpen && <div className="sidebar-overlay" onClick={handleSidebarClose} />}
      <aside
        className={`new-sidebar${collapsed ? ' collapsed' : ''}${isMobile && mobileOpen ? ' open-mobile' : ''}`}
        style={isMobile ? { left: mobileOpen ? 0 : '-250px', transition: 'left 0.3s' } : {}}
        onMouseEnter={!isMobile ? () => setCollapsed(false) : undefined}
        onMouseLeave={!isMobile ? () => setCollapsed(true) : undefined}
      >
        {isMobile && (
          <button className="sidebar-close-btn" onClick={handleSidebarClose} aria-label="Close Sidebar">
            <FiX size={28} />
          </button>
        )}
        <div className="sidebar-top">
          <img src={avatar} alt="Avatar" className="sidebar-avatar" />
          {!collapsed && (
            <div className="sidebar-welcome sidebar-welcome-row">
              <span>Welcome</span>
              <span className="sidebar-username">{getUserName()}</span>
            </div>
          )}
        </div>
        <nav className="sidebar-nav">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link${isActive || location.pathname.startsWith(link.to) ? ' active' : ''}`
              }
            >
              <span className="sidebar-highlight-bar" aria-hidden="true"></span>
              <span className="sidebar-icon">{link.icon}</span>
              {!collapsed && <span className="sidebar-label">{link.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={`sidebar-link${collapsed ? ' collapsed' : ''}`}
            style={{ width: '100%', border: 'none', background: 'none', padding: 'var(--space-3) var(--space-4)', fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: collapsed ? 'center' : 'flex-start' }}
            onClick={async (e) => {
              e.stopPropagation();
              await logout();
              addToast({
                type: 'success',
                title: 'Signed out',
                message: 'You have been signed out successfully.',
                duration: 2500
              });
              navigate('/login', { replace: true });
            }}
            aria-label="Sign Out"
          >
            <span className="sidebar-highlight-bar" aria-hidden="true"></span>
            <span className="sidebar-icon"><FiLogOut /></span>
            {!collapsed && <span className="sidebar-label">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
} 