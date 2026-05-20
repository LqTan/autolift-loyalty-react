import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type NotificationView } from "@/lib/api";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [formData, setFormData] = useState({
    eventType: "",
    channel: "EMAIL",
    recipient: "",
    subject: "",
    body: "",
  });

  const fetchNotifications = async () => {
    try {
      const data = await api.get<NotificationView[]>("/api/notifications?limit=100&offset=0");
      setNotifications(data);
    } catch {
      toast.error("Failed to fetch notifications");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post("/api/notifications", formData);
      toast.success("Notification created successfully");
      setDialogOpen(false);
      fetchNotifications();
    } catch {
      toast.error("Failed to create notification");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      SENT: "default",
      PENDING: "secondary",
      FAILED: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const filteredNotifications = filterStatus === "ALL"
    ? notifications
    : notifications.filter((n) => n.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Manage customer notifications</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Create Notification</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Notifications</CardTitle>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No notifications found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">{notification.eventType}</TableCell>
                    <TableCell>{notification.channel}</TableCell>
                    <TableCell>{notification.recipient}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{notification.subject}</TableCell>
                    <TableCell>{getStatusBadge(notification.status)}</TableCell>
                    <TableCell>
                      {notification.sentAt ? new Date(notification.sentAt).toLocaleString() : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Input id="eventType" value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="channel">Channel</Label>
              <Select value={formData.channel} onValueChange={(v) => setFormData({ ...formData, channel: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="PUSH">Push</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Input id="recipient" value={formData.recipient} onChange={(e) => setFormData({ ...formData, recipient: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="body">Body</Label>
              <Input id="body" value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}