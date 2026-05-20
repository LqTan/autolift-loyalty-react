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
import { api, type PromotionView } from "@/lib/api";
import { toast } from "sonner";

interface CreatePromotionRequest {
  name: string;
  description?: string;
  promotionType: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderAmount?: number;
  applicableCustomerSegment?: string;
  startDate: string;
  endDate: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreatePromotionRequest>({
    name: "",
    description: "",
    promotionType: "PERCENTAGE",
    value: 0,
    minOrderAmount: 0,
    applicableCustomerSegment: "",
    startDate: "",
    endDate: "",
  });

  const fetchPromotions = async () => {
    try {
      const data = await api.get<PromotionView[]>("/api/promotions");
      setPromotions(data);
    } catch {
      toast.error("Failed to fetch promotions");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post("/api/promotions", formData);
      toast.success("Promotion created successfully");
      setDialogOpen(false);
      fetchPromotions();
    } catch {
      toast.error("Failed to create promotion");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.post(`/api/promotions/${id}/activate`);
      toast.success("Promotion activated");
      fetchPromotions();
    } catch {
      toast.error("Failed to activate promotion");
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await api.post(`/api/promotions/${id}/deactivate`);
      toast.success("Promotion deactivated");
      fetchPromotions();
    } catch {
      toast.error("Failed to deactivate promotion");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground">Manage promotional offers</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Create Promotion</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No promotions found
                    </TableCell>
                  </TableRow>
                ) : (
                  promotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{promotion.name}</div>
                          {promotion.description && (
                            <div className="text-sm text-muted-foreground">{promotion.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{promotion.promotionType}</TableCell>
                      <TableCell>{promotion.value}%</TableCell>
                      <TableCell>
                        <Badge variant={promotion.status === "ACTIVE" ? "default" : "secondary"}>
                          {promotion.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(promotion.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(promotion.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {promotion.status === "ACTIVE" ? (
                            <Button variant="outline" size="sm" onClick={() => handleDeactivate(promotion.id)}>
                              Deactivate
                            </Button>
                          ) : (
                            <Button variant="default" size="sm" onClick={() => handleActivate(promotion.id)}>
                              Activate
                            </Button>
                          )}
                        </div>
                      </TableCell>
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
            <DialogTitle>Create Promotion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="promotionType">Type</Label>
                <Select value={formData.promotionType} onValueChange={(v) => setFormData({ ...formData, promotionType: v as "PERCENTAGE" | "FIXED_AMOUNT" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input id="value" type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })} />
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