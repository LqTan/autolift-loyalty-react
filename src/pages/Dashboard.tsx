import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  Users,
  Ticket,
  Tag,
  Target,
  FileText,
  Bot,
  TrendingUp,
} from "lucide-react";

const stats = [
  { title: "Campaigns", icon: Megaphone, to: "/campaigns", color: "text-blue-500" },
  { title: "Customers", icon: Users, to: "/customers", color: "text-green-500" },
  { title: "Vouchers", icon: Ticket, to: "/vouchers", color: "text-purple-500" },
  { title: "Promotions", icon: Tag, to: "/promotions", color: "text-orange-500" },
  { title: "Targeting", icon: Target, to: "/targeting", color: "text-red-500" },
  { title: "GP Rules", icon: FileText, to: "/gp-rules", color: "text-cyan-500" },
  { title: "ML Jobs", icon: Bot, to: "/ml-jobs", color: "text-pink-500" },
  { title: "Loyalty", icon: TrendingUp, to: "/loyalty", color: "text-yellow-500" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary">Overview</Badge>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to AutoLift Loyalty Dashboard. Select a module to manage.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, icon: Icon, to, color }) => (
          <Link key={title} to={to}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
              </CardHeader>
              <CardContent>
                <CardDescription>Manage {title.toLowerCase()}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}