import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";

export default function AccountMenu({ handleLogout, user }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleProfileClick = () => {
    navigate("/perfil");
    handleClose();
  };
  const handleSettingsClick = () => {
    navigate("/edit-profile");
    handleClose();
  };

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title="Minha Conta">
          <IconButton
            onClick={handleClick}
            size="small"
            // --- AJUSTE: Removi 'ml: 25' e deixei automático. 
            // O CSS da navbar cuida do espaçamento (justify-content: flex-end).
            sx={{ ml: 1 }} 
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar
              sx={{ width: 40, height: 40, border: '2px solid rgba(255,255,255,0.2)' }}
              src={user?.avatar}
              alt={user?.name}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.5))",
            mt: 1.5,
            bgcolor: '#1a1a1a', // Fundo Dark
            color: '#fff',      // Texto Claro
            border: '1px solid #333',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: '#1a1a1a',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              borderLeft: '1px solid #333',
              borderTop: '1px solid #333',
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleProfileClick}>
          <Avatar src={user?.avatar} /> Perfil
        </MenuItem>
        
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <Settings fontSize="small" sx={{ color: '#aaa' }} />
          </ListItemIcon>
          Configurações
        </MenuItem>
        
        <MenuItem onClick={() => { handleClose(); handleLogout(); }}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: '#d32f2f' }} />
          </ListItemIcon>
          <span style={{ color: '#d32f2f' }}>Sair</span>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}