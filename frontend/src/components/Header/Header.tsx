import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "../../utils/toast";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Button from "../Button/Button";
import UserAvatar from "../UserAvatar/UserAvatar";
import TruncatedText from "../TruncatedText/TruncatedText";
import { authService } from "../../features/auth";
import { clearUser } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toggleMode } from "../../store/themeSlice";
import {
  addNotification,
  clearNotifications,
  initializeNotifications,
  markAllAsRead,
  markAsRead,
  AppNotification,
} from "../../store/notificationSlice";
import { useComplaintSockets } from "../../features/complaints/hooks/useComplaintSockets";
import { labelOf, STATUSES } from "../../utils/constants";
import { timeAgo } from "../../utils/format";

export default function Header({ onMenu }: { onMenu: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const mode = useAppSelector((s) => s.theme.mode);
  const notifications = useAppSelector((s) => s.notification.items);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);

  // Initialize stored notifications on load
  useEffect(() => {
    if (user) {
      dispatch(initializeNotifications({ userId: user.id }));
    }
  }, [user, dispatch]);

  // Listen for real-time socket events & record notifications
  useComplaintSockets((event, payload) => {
    if (!user) return;
    if (event === "created") {
      if (user.role === "admin" && payload.residentId !== user.id) {
        dispatch(
          addNotification({
            notification: {
              title: "New Complaint Registered",
              message: `${payload.residentName} (${payload.flatNumber || "Resident"}) submitted "${payload.title}"`,
              type: "created",
              complaintId: payload.id,
            },
            userId: user.id,
          })
        );
      }
    } else if (event === "updated") {
      if (payload.status === "cancelled") {
        if (user.role === "admin" && payload.residentId !== user.id) {
          dispatch(
            addNotification({
              notification: {
                title: "Complaint Cancelled",
                message: `Resident ${payload.residentName || "User"} cancelled complaint "${payload.title}"`,
                type: "updated",
                complaintId: payload.id,
              },
              userId: user.id,
            })
          );
        }
      } else {
        if (payload.residentId === user.id && user.role !== "admin") {
          dispatch(
            addNotification({
              notification: {
                title: "Complaint Status Changed",
                message: `Your complaint "${payload.title}" is now ${labelOf(STATUSES, payload.status || "")}`,
                type: "updated",
                complaintId: payload.id,
              },
              userId: user.id,
            })
          );
        }
      }
    } else if (event === "commented") {
      if (payload.userId !== user.id) {
        dispatch(
          addNotification({
            notification: {
              title: "New Comment Received",
              message: `${payload.authorName} commented on "${payload.title}"`,
              type: "commented",
              complaintId: payload.complaintId,
            },
            userId: user.id,
          })
        );
      }
    }
  });

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

  const getNotifIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "created":
        return <CampaignOutlinedIcon style={{ fontSize: 18 }} className="text-blue-500" />;
      case "updated":
        return <CheckCircleOutlinedIcon style={{ fontSize: 18 }} className="text-emerald-500" />;
      case "commented":
        return <ChatOutlinedIcon style={{ fontSize: 18 }} className="text-amber-500" />;
      default:
        return <InfoOutlinedIcon style={{ fontSize: 18 }} className="text-slate-400" />;
    }
  };

  const handleNotificationClick = (item: AppNotification) => {
    dispatch(markAsRead({ id: item.id, userId: user?.id }));
    setNotifAnchor(null);
    if (item.complaintId) {
      navigate(`/complaints/${item.complaintId}`);
    }
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
            {/* Notification Icon Button */}
            <Tooltip title="Notifications">
              <button
                type="button"
                onClick={(e) => setNotifAnchor(e.currentTarget)}
                aria-label="View notifications"
                className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-mute hover:bg-slate-100 hover:text-ink dark:hover:bg-slate-800 transition-colors outline-none"
              >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsOutlinedIcon fontSize="small" />
                </Badge>
              </button>
            </Tooltip>

            {/* Notification Popover Drawer */}
            <Popover
              open={!!notifAnchor}
              anchorEl={notifAnchor}
              onClose={() => setNotifAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    width: 360,
                    maxWidth: "calc(100vw - 32px)",
                    maxHeight: 480,
                    borderRadius: "20px",
                    backgroundImage: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  },
                },
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-canvas shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-small font-bold text-ink">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-caption font-semibold text-primary">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Tooltip title="Mark all as read">
                      <button
                        type="button"
                        onClick={() => dispatch(markAllAsRead({ userId: user.id }))}
                        className="p-1 rounded bg-transparent text-mute hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <DoneAllIcon style={{ fontSize: 18 }} />
                      </button>
                    </Tooltip>
                  )}
                  {notifications.length > 0 && (
                    <Tooltip title="Clear all">
                      <button
                        type="button"
                        onClick={() => dispatch(clearNotifications({ userId: user.id }))}
                        className="p-1 rounded bg-transparent text-mute hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <DeleteOutlinedIcon style={{ fontSize: 18 }} />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 bg-canvas">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-mute gap-2">
                    <NotificationsOutlinedIcon style={{ fontSize: 40 }} className="opacity-30" />
                    <p className="text-small font-medium text-ink">No notifications yet</p>
                    <p className="text-caption text-mute">You are all caught up!</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNotificationClick(item)}
                      className={`w-full text-left p-3.5 flex gap-3 items-start transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                        !item.read ? "bg-primary/5 dark:bg-primary/10" : ""
                      }`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        {getNotifIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-small truncate ${!item.read ? "font-bold text-ink" : "font-medium text-ink/80"}`}>
                            {item.title}
                          </p>
                          <span className="text-[11px] text-mute shrink-0">{timeAgo(item.timestamp)}</span>
                        </div>
                        <p className="text-caption text-mute line-clamp-2 mt-0.5">{item.message}</p>
                      </div>
                      {!item.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </button>
                  ))
                )}
              </div>
            </Popover>

            {/* Account Menu Button */}
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
