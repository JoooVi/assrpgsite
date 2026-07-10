import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
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
          <Box
            component="button"
            onClick={handleClick}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            sx={{
              alignItems: "center",
              background: open ? "rgba(138, 28, 24, 0.18)" : "rgba(17, 17, 17, 0.82)",
              border: open
                ? "1px solid rgba(255, 51, 51, 0.45)"
                : "1px solid rgba(255,255,255,0.12)",
              color: "#dcdcdc",
              cursor: "pointer",
              display: "flex",
              gap: "10px",
              minHeight: 42,
              px: "10px",
              py: "4px",
              textTransform: "uppercase",
              transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
              "&:hover, &:focus-visible": {
                background: "rgba(138, 28, 24, 0.2)",
                borderColor: "rgba(255, 51, 51, 0.55)",
                color: "#fff",
                outline: "none",
              },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                border: "1px solid rgba(255, 51, 51, 0.5)",
                bgcolor: "#1a1a1a",
                color: "#ff7777",
                fontFamily: '"Roboto Condensed", sans-serif',
                fontSize: "0.92rem",
                fontWeight: 700,
              }}
              src={user?.avatar}
              alt={user?.name}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box
              component="span"
              sx={{
                display: { xs: "none", lg: "inline-flex" },
                fontFamily: '"Roboto Condensed", sans-serif',
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "1.1px",
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name || "Agente"}
            </Box>
          </Box>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 18px 32px rgba(0,0,0,0.7))",
            mt: 1.5,
            bgcolor: "#111",
            color: "#dcdcdc",
            border: "1px solid rgba(255, 51, 51, 0.28)",
            borderRadius: 0,
            minWidth: 210,
            "& .MuiMenuItem-root": {
              fontFamily: '"Roboto Condensed", sans-serif',
              fontWeight: 700,
              letterSpacing: "0.7px",
              minHeight: 44,
              textTransform: "uppercase",
            },
            "& .MuiMenuItem-root:hover": {
              bgcolor: "rgba(138, 28, 24, 0.18)",
            },
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "#111",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
              borderLeft: "1px solid rgba(255, 51, 51, 0.28)",
              borderTop: "1px solid rgba(255, 51, 51, 0.28)",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleProfileClick}>
          <Avatar src={user?.avatar} />
          Perfil
        </MenuItem>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <Settings fontSize="small" sx={{ color: "#aaa" }} />
          </ListItemIcon>
          Configurações
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            handleLogout();
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: "#ff5555" }} />
          </ListItemIcon>
          <span style={{ color: "#ff5555" }}>Sair</span>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
