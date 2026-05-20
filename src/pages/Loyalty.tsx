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
import { api, type LoyaltyAccountResponse } from "@/lib/api";
import { toast } from "sonner";

export default function LoyaltyPage() {
  const [accounts, setAccounts] = useState<LoyaltyAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [addPointsDialog, setAddPointsDialog] = useState<{ open: boolean; accountId: string; currentPoints: number }>({
    open: false,
    accountId: "",
    currentPoints: 0,
  });
  const [usePointsDialog, setUsePointsDialog] = useState<{ open: boolean; accountId: string; currentPoints: number }>({
    open: false,
    accountId: "",
    currentPoints: 0,
  });
  const [pointsAmount, setPointsAmount] = useState(0);

  const fetchAccounts = async () => {
    try {
      const data = await api.get<LoyaltyAccountResponse[]>("/api/loyalty/accounts");
      setAccounts(data);
    } catch {
      toast.error("Failed to fetch loyalty accounts");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post("/api/loyalty/accounts", { customerId: customerIdInput });
      toast.success("Loyalty account created successfully");
      setDialogOpen(false);
      setCustomerIdInput("");
      fetchAccounts();
    } catch {
      toast.error("Failed to create loyalty account");
    }
  };

  const handleAddPoints = async () => {
    try {
      await api.post(`/api/loyalty/accounts/${addPointsDialog.accountId}/add-points`, {
        amount: pointsAmount,
        referenceId: "admin-add",
      });
      toast.success("Points added successfully");
      setAddPointsDialog({ open: false, accountId: "", currentPoints: 0 });
      setPointsAmount(0);
      fetchAccounts();
    } catch {
      toast.error("Failed to add points");
    }
  };

  const handleUsePoints = async () => {
    try {
      await api.post(`/api/loyalty/accounts/${usePointsDialog.accountId}/use-points`, {
        amount: pointsAmount,
        referenceId: "admin-use",
      });
      toast.success("Points used successfully");
      setUsePointsDialog({ open: false, accountId: "", currentPoints: 0 });
      setPointsAmount(0);
      fetchAccounts();
    } catch {
      toast.error("Failed to use points");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loyalty Accounts</h1>
          <p className="text-muted-foreground">Manage customer loyalty points</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Create Account</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : accounts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No loyalty accounts found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Points Balance</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono text-sm">{account.id}</TableCell>
                    <TableCell className="font-mono text-sm">{account.customerId}</TableCell>
                    <TableCell className="font-medium text-lg">{account.pointsBalance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{account.tier}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.status === "ACTIVE" ? "default" : "secondary"}>{account.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(account.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAddPointsDialog({ open: true, accountId: account.id, currentPoints: account.pointsBalance })}
                        >
                          Add Points
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUsePointsDialog({ open: true, accountId: account.id, currentPoints: account.pointsBalance })}
                        >
                          Use Points
                        </Button>
                      </div>
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
            <DialogTitle>Create Loyalty Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerId">Customer ID</Label>
              <Input id="customerId" value={customerIdInput} onChange={(e) => setCustomerIdInput(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addPointsDialog.open} onOpenChange={(open) => setAddPointsDialog({ ...addPointsDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Points</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Current Balance: <strong>{addPointsDialog.currentPoints.toLocaleString()}</strong></p>
            <div>
              <Label htmlFor="points">Points to Add</Label>
              <Input id="points" type="number" value={pointsAmount} onChange={(e) => setPointsAmount(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPointsDialog({ open: false, accountId: "", currentPoints: 0 })}>Cancel</Button>
            <Button onClick={handleAddPoints}>Add Points</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={usePointsDialog.open} onOpenChange={(open) => setUsePointsDialog({ ...usePointsDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Use Points</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Current Balance: <strong>{usePointsDialog.currentPoints.toLocaleString()}</strong></p>
            <div>
              <Label htmlFor="points">Points to Use</Label>
              <Input id="points" type="number" value={pointsAmount} onChange={(e) => setPointsAmount(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUsePointsDialog({ open: false, accountId: "", currentPoints: 0 })}>Cancel</Button>
            <Button onClick={handleUsePoints}>Use Points</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}