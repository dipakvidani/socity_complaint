import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "../../utils/toast";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "../Button/Button";
import UserAvatar from "../UserAvatar/UserAvatar";
import TruncatedText from "../TruncatedText/TruncatedText";
import { authService } from "../../features/auth";
import { clearUser } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toggleMode } from "../../store/themeSlice";

export default function Header({ onMenu }: { onMenu: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const mode = useAppSelector((s) => s.theme.mode);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const logout = async () => {
    setAnchor(null);
    try {
      await authService.logout();
      toast.success("You have been logged out. See you soon!");
    } catch {
      toast.error("We could not log you out cleanly, but your session was cleared on this device.");
    }
    dispatch(clearUser());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-hairline bg-canvas px-page">
      <Button variant="icon" onClick={onMenu} aria-label="Open menu" className="lg:hidden">
        <MenuIcon fontSize="small" />
      </Button>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="icon" onClick={() => dispatch(toggleMode())} aria-label="Switch theme">
          {mode === "dark" ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
        </Button>
        {user && (
          <>
            <button
              type="button"
              onClick={(e) => setAnchor(e.currentTarget)}
              aria-label="Open account menu"
              aria-haspopup="menu"
              className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-card py-0 pr-3 pl-1 outline-none focus-visible:ring-4 focus-visible:ring-focus"
            >
              <UserAvatar user={user} size={32} />
              <span className="hidden max-w-32 sm:block">
                <TruncatedText text={user.fullName} className="text-small font-semibold text-ink" />
              </span>
            </button>
            <Menu
              anchorEl={anchor}
              open={!!anchor}
              onClose={() => setAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{ paper: { sx: { mt: 1, minWidth: 220, borderRadius: "16px", backgroundImage: "none" } } }}
            >
              <div className="flex max-w-60 flex-col px-4 py-2">
                <TruncatedText text={user.fullName} className="text-small font-bold text-ink" />
                <TruncatedText text={user.email} className="text-caption text-mute" />
              </div>
              <Divider />
              <MenuItem
                onClick={() => {
                  setAnchor(null);
                  navigate("/profile");
                }}
              >
                <ListItemIcon>
                  <PersonOutlineIcon fontSize="small" />
                </ListItemIcon>
                My profile
              </MenuItem>
              <MenuItem onClick={logout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Log out
              </MenuItem>
            </Menu>
          </>
        )}
      </div>
    </header>
  );
}
