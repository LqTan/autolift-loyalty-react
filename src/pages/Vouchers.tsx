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
import { api, type VoucherResponse } from "@/lib/api";
import { toast } from "sonner";

interface CreateVoucherRequest {
  code: string;
  campaignId?: string;
  type?: "DISCOUNT_PERCENTAGE" | "DISCOUNT_FIXED_AMOUNT" | "FREE_SHIPPING" | "BUY_X_GET_Y";
  value?: number;
  minOrderAmount?: number;
  maxUsage?: number;
  validFrom?: string;
  validUntil?: string;
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateVoucherRequest>({
    code: "",
    campaignId: "",
    type: "DISCOUNT_PERCENTAGE",
    value: 0,
    minOrderAmount: 0,
    maxUsage: 1,
  });

  const fetchVouchers = async () => {
    try {
      const data = await api.get<VoucherResponse[]>("/api/vouchers");
      setVouchers(data);
    } catch {
      toast.error("Failed to fetch vouchers");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post("/api/vouchers", formData);
      toast.success("Voucher created successfully");
      setDialogOpen(false);
      fetchVouchers();
    } catch {
      toast.error("Failed to create voucher");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      USED: "secondary",
      EXPIRED: "destructive",
      CANCELLED: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vouchers</h1>
          <p className="text-muted-foreground">Manage vouchers and promotions</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Create Voucher</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vouchers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No vouchers found
                    </TableCell>
                  </TableRow>
                ) : (
                  vouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell className="font-mono font-medium">{voucher.code}</TableCell>
                      <TableCell>{voucher.type}</TableCell>
                      <TableCell>{voucher.value}</TableCell>
                      <TableCell>{voucher.usedCount} / {voucher.maxUsage}</TableCell>
                      <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                      <TableCell>{voucher.validUntil ? new Date(voucher.validUntil).toLocaleDateString() : "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Voucher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as CreateVoucherRequest["type"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISCOUNT_PERCENTAGE">Discount Percentage</SelectItem>
                    <SelectItem value="DISCOUNT_FIXED_AMOUNT">Fixed Amount</SelectItem>
                    <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                    <SelectItem value="BUY_X_GET_Y">Buy X Get Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input id="value" type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minOrderAmount">Min Order Amount</Label>
                <Input id="minOrderAmount" type="number" value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="maxUsage">Max Usage</Label>
                <Input id="maxUsage" type="number" value={formData.maxUsage} onChange={(e) => setFormData({ ...formData, maxUsage: Number(e.target.value) })} />
              </div>
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