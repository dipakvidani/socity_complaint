import { useState } from "react";
import { Outlet } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-hairline lg:block">
        <Sidebar />
      </aside>
      <Drawer open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: 240, backgroundImage: "none" } } }}>
        <Sidebar onNavigate={() => setOpen(false)} />
      </Drawer>
      <div className="lg:pl-60">
        <Header onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-content px-page py-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
