import React from "react";
import { useTheme } from "../context/ThemeContext";

interface UserInfoCardProps {
  user: { username: string; email: string };
}

const cardStyleBase = {
  fontFamily: 'Inter, ui-sans-serif, system-ui',
  borderRadius: 18,
  boxShadow: '0 8px 32px 0 rgba(60,72,135,0.12)',
  border: '1.5px solid #e0e7ff',
  backdropFilter: 'blur(7px)',
  WebkitBackdropFilter: 'blur(7px)',
  padding: '22px 26px',
  transition: 'box-shadow 0.18s, background 0.18s',
  marginBottom: 0,
  minWidth: 260,
  maxWidth: 420,
  width: '100%',
};

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user }) => {
  const { dark } = useTheme();
  return (
    <div
      style={{
        ...cardStyleBase,
        background: dark ? 'rgba(36,37,46,0.86)' : 'rgba(255,255,255,0.93)',
        color: dark ? '#a5b4fc' : '#232136',
        border: dark ? '1.5px solid #6366f1' : '1.5px solid #e0e7ff',
        boxShadow: dark
          ? '0 8px 32px 0 rgba(99,102,241,0.18)'
          : '0 8px 32px 0 rgba(60,72,135,0.12)',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 19, color: dark ? '#c7d2fe' : '#232136', marginBottom: 5 }}>
        {user.username}
      </div>
      <div style={{ color: '#818cf8', fontWeight: 700, fontSize: 15 }}>
        Email:
        <span style={{ color: dark ? '#a5b4fc' : '#64748b', fontWeight: 500, marginLeft: 6 }}>{user.email}</span>
      </div>
    </div>
  );
};

export default UserInfoCard;
