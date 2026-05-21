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
import { api, type CampaignResponse, type GpRuleView } from "@/lib/api";

export default function GpRulesPage() {
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [rules, setRules] = useState<GpRuleView[]>([]);
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

  const fetchRules = async (campaignId: string) => {
    try {
      const data = await api.get<GpRuleView[]>(`/api/explainability/campaigns/${campaignId}/gp-rules`);
      setRules(data);
    } catch {
      setRules([]);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchRules(selectedCampaign);
    }
  }, [selectedCampaign]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">GP Rules</h1>
        <p className="text-muted-foreground">Explain model decisions with generalized policy rules</p>
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
          <CardTitle>GP Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : rules.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No rules found for this campaign
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Text</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Precision</TableHead>
                  <TableHead>Recall</TableHead>
                  <TableHead>F1</TableHead>
                  <TableHead>Coverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="max-w-md truncate">{rule.ruleText}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{rule.targetLabel}</Badge>
                    </TableCell>
                    <TableCell>{rule.precisionValue.toFixed(4)}</TableCell>
                    <TableCell>{rule.recallValue.toFixed(4)}</TableCell>
                    <TableCell>{rule.f1Score.toFixed(4)}</TableCell>
                    <TableCell>{rule.coverageValue.toFixed(4)}</TableCell>
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