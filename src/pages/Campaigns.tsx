import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface PaginatedCampaignsResponse {
  content: CampaignResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(5);
  const [formData, setFormData] = useState<CreateCampaignRequest>({
    name: "",
    description: "",
    budgetAmount: 0,
    budgetCurrency: "USD",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const displayRows = 10;
  const tableRowHeight = 48;
  const tableHeaderHeight = 50;
  const tableMaxHeight = tableHeaderHeight + (displayRows * tableRowHeight);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const fetchCampaigns = async () => {
    setIsAnimating(true);
    try {
      const data = await api.get<PaginatedCampaignsResponse>(`/api/campaigns?page=${currentPage}&size=${pageSize}`);
      setTimeout(() => {
        setCampaigns(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
        setIsAnimating(false);
      }, 600);
    } catch {
      toast.error("Failed to fetch campaigns");
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [currentPage, pageSize]);

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
          <Button className="cursor-pointer" onClick={() => setDialogOpen(true)}>Create Campaign</Button>
          <Button className="cursor-pointer" variant="outline" onClick={() => setGenerateDialogOpen(true)}>Generate Test Campaigns</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isAnimating && (
              <div className="absolute inset-x-0 top-0 z-20 h-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: "100%",
                    animation: "load 0.6s ease-out forwards",
                  }}
                />
                <style>{`@keyframes load { 0% { transform: translateX(-100%); } 100% { transform: translateX(0); } }`}</style>
              </div>
            )}
            <div className="overflow-auto" style={{ maxHeight: `${tableMaxHeight}px` }}>
              <table className="w-full caption-bottom text-sm">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr>
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">Name</th>
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">Status</th>
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">Budget</th>
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">Start Date</th>
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">End Date</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {campaigns.length === 0 ? (
                    <tr className="border-b">
                      <td colSpan={5} className="p-2 align-middle text-center py-8 text-muted-foreground">
                        No campaigns found
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-2 align-middle">
                          <div className="font-medium">{campaign.name}</div>
                          {campaign.description && (
                            <div className="text-sm text-muted-foreground">{campaign.description}</div>
                          )}
                        </td>
                        <td className="p-2 align-middle">{getStatusBadge(campaign.status)}</td>
                        <td className="p-2 align-middle">
                          {campaign.budgetAmount
                            ? `${campaign.budgetAmount} ${campaign.budgetCurrency || "USD"}`
                            : "-"}
                        </td>
                        <td className="p-2 align-middle">{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "-"}</td>
                        <td className="p-2 align-middle">{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {campaigns.length > 0 && (
              <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements.toLocaleString()} campaigns
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
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