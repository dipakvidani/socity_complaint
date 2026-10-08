import { NavLink } from "react-router-dom";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import { useAppSelector } from "../../store/hooks";

const profile = { to: "/profile", label: "My profile", icon: <PersonOutlineIcon fontSize="small" /> };

const links = {
  resident: [{ to: "/my-complaints", label: "My complaints", icon: <AssignmentOutlinedIcon fontSize="small" /> }, profile],
  admin: [{ to: "/admin", label: "All complaints", icon: <DashboardOutlinedIcon fontSize="small" /> }, profile],
};

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const role = useAppSelector((s) => s.auth.user?.role);

  return (
    <nav className="flex h-full flex-col gap-6 bg-canvas p-4 border-r border-hairline/60">
      <div className="flex items-center gap-2.5 px-3 pt-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-black text-on-primary text-sm shadow-sm">
          SD
        </span>
        <p className="text-title font-extrabold tracking-tight text-ink">Society Desk</p>
      </div>
      <ul className="flex flex-col gap-2">
        {(role ? links[role] : []).map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded-full px-4 text-small font-bold outline-none transition-all focus-visible:ring-4 focus-visible:ring-focus ${
                  isActive ? "bg-primary text-on-primary shadow-xs" : "text-ink hover:bg-secondary/70 active:bg-secondary"
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

