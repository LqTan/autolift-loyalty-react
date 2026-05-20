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
import { api, type SandboxResponse } from "@/lib/api";
import { toast } from "sonner";

export default function SandboxPage() {
  const [sandboxes, setSandboxes] = useState<SandboxResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const fetchSandboxes = async () => {
    try {
      const data = await api.get<SandboxResponse[]>("/api/sandbox");
      setSandboxes(data);
    } catch {
      toast.error("Failed to fetch sandboxes");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSandboxes();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post("/api/sandbox", { name: nameInput });
      toast.success("Sandbox created successfully");
      setDialogOpen(false);
      setNameInput("");
      fetchSandboxes();
    } catch {
      toast.error("Failed to create sandbox");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/sandbox/${id}`);
      toast.success("Sandbox deleted successfully");
      fetchSandboxes();
    } catch {
      toast.error("Failed to delete sandbox");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sandbox</h1>
          <p className="text-muted-foreground">Manage sandbox environments</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Create Sandbox</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sandboxes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : sandboxes.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No sandboxes found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sandboxes.map((sandbox) => (
                  <TableRow key={sandbox.id}>
                    <TableCell className="font-mono text-sm">{sandbox.id}</TableCell>
                    <TableCell className="font-medium">{sandbox.name}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(sandbox.id)}>
                        Delete
                      </Button>
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
            <DialogTitle>Create Sandbox</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
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