import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Ticket,
  Tag,
  Target,
  FileText,
  Bell,
  Award,
  Bot,
  Boxes,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/campaigns", icon: Megaphone, label: "Campaigns" },
  { to: "/customers", icon: Users, label: "Customers" },
  { to: "/vouchers", icon: Ticket, label: "Vouchers" },
  { to: "/promotions", icon: Tag, label: "Promotions" },
  { to: "/targeting", icon: Target, label: "Targeting" },
  { to: "/gp-rules", icon: FileText, label: "GP Rules" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/loyalty", icon: Award, label: "Loyalty" },
  { to: "/ml-jobs", icon: Bot, label: "ML Jobs" },
  { to: "/sandbox", icon: Boxes, label: "Sandbox" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <span className="font-heading text-lg font-semibold">AutoLift</span>
        )}
        {collapsed && <span className="font-heading text-lg font-semibold">A</span>}
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                    collapsed && "justify-center px-2"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Separator />

      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("w-full", collapsed ? "px-2" : "justify-start")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}