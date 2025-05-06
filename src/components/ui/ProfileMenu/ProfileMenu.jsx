import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../store/userSlice";
import {
    Avatar,
    Menu,
    MenuItem,
    Typography,
    Divider,
    ListItemIcon,
    Box,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

export default function ProfileMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
        handleClose();
    };

    const handleSettings = () => {
        navigate("/settings");
        handleClose();
    };

    if (!user.name) return null;

    return (
        <>
            <Avatar
                onClick={handleClick}
                sx={{
                    bgcolor: "#f8fafc",
                    color: "#1e3a8a",
                    fontWeight: "bold",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                    cursor: "pointer",
                    border: "2px solid #cbd5e1",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 0 0 4px rgba(203, 213, 225, 0.5)"
                    }
                }}
            >
                {user.name[0]}
            </Avatar>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        minWidth: 220,
                        backgroundColor: "#ffffff", // контрастніший фон
                        color: "#1e293b",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                        overflow: "visible",
                        "& .MuiMenuItem-root": {
                            fontSize: 14,
                            "&:hover": {
                                backgroundColor: "#f1f5f9",
                            },
                        },
                        "& .MuiDivider-root": {
                            backgroundColor: "#e2e8f0",
                        },
                        "& .MuiListItemIcon-root": {
                            color: "#64748b",
                        },
                        "&:before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: "#ffffff",
                            transform: "translateY(-50%) rotate(45deg)",
                            boxShadow: "-1px -1px 1px rgba(0,0,0,0.05)",
                            zIndex: 0,
                        },
                    },
                }}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                        {user.name} {user.surname}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                        {user.mainRole}{user.isReviewer && " + Reviewer"}
                    </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleSettings}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Налаштування
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Вийти
                </MenuItem>
            </Menu>
        </>
    );
}
