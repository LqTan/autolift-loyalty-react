import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type CampaignResponse, type TargetCustomerResponse } from "@/lib/api";

export default function TargetingPage() {
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [candidates, setCandidates] = useState<TargetCustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const data = await api.get<CampaignResponse[]>("/api/campaigns");
      const campaignsArray = Array.isArray(data) ? data : [];
      setCampaigns(campaignsArray);
      if (campaignsArray.length > 0) {
        setSelectedCampaign(campaignsArray[0].id);
      }
    } catch {
      // silent fail
    }
    setLoading(false);
  };

  const fetchCandidates = async (campaignId: string) => {
    try {
      const data = await api.get<TargetCustomerResponse[]>(`/api/targeting/campaigns/${campaignId}/candidates?limit=100`);
      setCandidates(data);
    } catch {
      setCandidates([]);
    }
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Targeting</h1>
        <p className="text-muted-foreground">View uplift target customers</p>
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
              No candidates found for this campaign
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Uplift Score</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Treatment Prob</TableHead>
                  <TableHead>Control Prob</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.customerId}>
                    <TableCell className="font-mono text-sm">{candidate.customerId}</TableCell>
                    <TableCell className="font-medium">{candidate.upliftScore.toFixed(4)}</TableCell>
                    <TableCell>{getSegmentBadge(candidate.segment)}</TableCell>
                    <TableCell>{candidate.treatmentProbability.toFixed(4)}</TableCell>
                    <TableCell>{candidate.controlProbability.toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}