import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type CampaignResponse, type TargetCustomerResponse } from "@/lib/api";

interface PaginatedCampaignsResponse {
  content: CampaignResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export default function TargetingPage() {
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [candidates, setCandidates] = useState<TargetCustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const data = await api.get<PaginatedCampaignsResponse>("/api/campaigns?size=1000");
      const campaignsArray = data.content || [];
      setCampaigns(campaignsArray);
      if (campaignsArray.length > 0 && !selectedCampaign) {
        setSelectedCampaign(campaignsArray[0].id);
      }
    } catch {
      // silent fail
    }
    setLoading(false);
  };

  const fetchCandidates = async (campaignId: string) => {
    setLoading(true);
    try {
      const data = await api.get<TargetCustomerResponse[]>(`/api/targeting/campaigns/${campaignId}/candidates?limit=100`);
      setCandidates(Array.isArray(data) ? data : []);
    } catch {
      setCandidates([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchCandidates(selectedCampaign);
    }
  }, [selectedCampaign]);

  const getSegmentBadge = (segment: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PERSUADABLE: "default",
      NEUTRAL: "secondary",
      DO_NOT_TARGET: "destructive",
    };
    return <Badge variant={variants[segment] || "secondary"}>{segment}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Targeting</h1>
          <p className="text-muted-foreground">View uplift target customers</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => selectedCampaign && fetchCandidates(selectedCampaign)}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : candidates.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No candidates found for this campaign. Run Uplift Scoring first.
            </div>
          ) : (
            <div className="overflow-auto" style={{ maxHeight: "500px" }}>
              <table className="w-full caption-bottom text-sm">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr>
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">Customer ID</th>
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">Uplift Score</th>
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">Segment</th>
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">Treatment Prob</th>
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">Control Prob</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {candidates.map((candidate) => (
                    <tr key={candidate.customerId} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-2 align-middle font-mono text-sm">{candidate.customerId}</td>
                      <td className="p-2 align-middle font-medium">{candidate.upliftScore.toFixed(4)}</td>
                      <td className="p-2 align-middle">{getSegmentBadge(candidate.segment)}</td>
                      <td className="p-2 align-middle">{candidate.treatmentProbability.toFixed(4)}</td>
                      <td className="p-2 align-middle">{candidate.controlProbability.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}