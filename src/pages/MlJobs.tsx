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
import { api, type MlJobResponse, type JobStatus, type CampaignResponse } from "@/lib/api";

export default function MlJobsPage() {
  const [jobs, setJobs] = useState<MlJobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);

  const fetchCampaigns = async () => {
    try {
      const data = await api.get<CampaignResponse[]>("/api/campaigns");
      setCampaigns(data);
    } catch {
      setCampaigns([]);
    }
  };

  const fetchJobs = async (campaignId: string) => {
    try {
      const data = await api.get<MlJobResponse[]>(`/api/ml/jobs/campaign/${campaignId}`);
      setJobs(data);
    } catch {
      setJobs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchJobs(selectedCampaign);
    } else {
      setJobs([]);
      setLoading(false);
    }
  }, [selectedCampaign]);

  const getStatusBadge = (status: JobStatus) => {
    const variants: Record<JobStatus, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      RUNNING: "default",
      COMPLETED: "outline",
      FAILED: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ML Jobs</h1>
        <p className="text-muted-foreground">Monitor machine learning jobs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a campaign to view ML jobs" />
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
          <CardTitle>ML Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedCampaign ? (
            <div className="py-8 text-center text-muted-foreground">
              Select a campaign to view ML jobs
            </div>
          ) : loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : jobs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No ML jobs found for this campaign
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Model Version</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono text-sm">{job.id}</TableCell>
                    <TableCell>{job.jobType}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>{job.modelVersion || "-"}</TableCell>
                    <TableCell>{new Date(job.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{job.startedAt ? new Date(job.startedAt).toLocaleString() : "-"}</TableCell>
                    <TableCell>{job.completedAt ? new Date(job.completedAt).toLocaleString() : "-"}</TableCell>
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