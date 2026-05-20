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
import { api, type CampaignResponse, type GenerateTestCampaignsResponse } from "@/lib/api";
import { toast } from "sonner";

interface CreateCampaignRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budgetAmount?: number;
  budgetCurrency?: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(5);
  const [formData, setFormData] = useState<CreateCampaignRequest>({
    name: "",
    description: "",
    budgetAmount: 0,
    budgetCurrency: "USD",
  });

  const fetchCampaigns = async () => {
    try {
      const data = await api.get<CampaignResponse[]>("/api/campaigns");
      setCampaigns(data);
    } catch {
      toast.error("Failed to fetch campaigns");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post("/api/campaigns", formData);
      toast.success("Campaign created successfully");
      setDialogOpen(false);
      fetchCampaigns();
    } catch {
      toast.error("Failed to create campaign");
    }
  };

  const handleGenerateTest = async () => {
    try {
      const result = await api.post<GenerateTestCampaignsResponse>("/api/campaigns/generate-test", { count: generateCount });
      toast.success(`Generated ${result.generated} test campaigns`);
      setGenerateDialogOpen(false);
      fetchCampaigns();
    } catch {
      toast.error("Failed to generate test campaigns");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      PAUSED: "secondary",
      COMPLETED: "outline",
      DRAFT: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Manage promotion campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setDialogOpen(true)}>Create Campaign</Button>
          <Button variant="outline" onClick={() => setGenerateDialogOpen(true)}>Generate Test Campaigns</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No campaigns found
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          {campaign.description && (
                            <div className="text-sm text-muted-foreground">{campaign.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        {campaign.budgetAmount
                          ? `${campaign.budgetAmount} ${campaign.budgetCurrency || "USD"}`
                          : "-"}
                      </TableCell>
                      <TableCell>{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : "-"}</TableCell>
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
            <DialogTitle>Create Campaign</DialogTitle>
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
                <Label htmlFor="budgetAmount">Budget Amount</Label>
                <Input id="budgetAmount" type="number" value={formData.budgetAmount} onChange={(e) => setFormData({ ...formData, budgetAmount: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="budgetCurrency">Currency</Label>
                <Input id="budgetCurrency" value={formData.budgetCurrency} onChange={(e) => setFormData({ ...formData, budgetCurrency: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Test Campaigns</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="count">Number of Campaigns</Label>
              <Input id="count" type="number" value={generateCount} onChange={(e) => setGenerateCount(Number(e.target.value))} min={1} max={100} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateTest}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}