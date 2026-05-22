import { useEffect, useState, useCallback } from "react";
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
import { Button } from "@/components/ui/button";
import { api, type MlJobResponse, type JobStatus, type CampaignResponse, type CreateMlJobRequest, type MlJobMetricsView } from "@/lib/api";
import { toast } from "sonner";
import UpliftCurveChart from "@/components/charts/UpliftCurveChart";
import QiniCurveChart from "@/components/charts/QiniCurveChart";
import EconomicComparisonChart from "@/components/charts/EconomicComparisonChart";

interface PaginatedMlJobsResponse {
  content: MlJobResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface PaginatedCampaignsResponse {
  content: CampaignResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export default function MlJobsPage() {
  const [jobs, setJobs] = useState<MlJobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [metrics, setMetrics] = useState<MlJobMetricsView | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<JobStatus>("PENDING");
  const [pollingMessage, setPollingMessage] = useState<string>("");

  const [isGPRulesPolling, setIsGPRulesPolling] = useState(false);
  const [gpRulesPollingStatus, setGpRulesPollingStatus] = useState<JobStatus>("PENDING");
  const [gpRulesPollingMessage, setGpRulesPollingMessage] = useState<string>("");

  const fetchCampaigns = async () => {
    try {
      const data = await api.get<PaginatedCampaignsResponse>("/api/campaigns?size=1000");
      setCampaigns(data.content || []);
    } catch {
      setCampaigns([]);
    }
  };

  const fetchJobs = async (campaignId: string) => {
    try {
      const data = await api.get<PaginatedMlJobsResponse>(`/api/ml/jobs/campaign/${campaignId}?size=100`);
      setJobs(data.content || []);
    } catch {
      setJobs([]);
    }
    setLoading(false);
  };

  const fetchMetrics = async (jobId: string) => {
    setMetricsLoading(true);
    try {
      const data = await api.get<MlJobMetricsView>(`/api/ml/jobs/${jobId}/metrics`);
      setMetrics(data);
    } catch {
      setMetrics(null);
    }
    setMetricsLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      setMetrics(null);
      setSelectedJobId(null);
      fetchJobs(selectedCampaign);
    } else {
      setJobs([]);
      setLoading(false);
    }
  }, [selectedCampaign]);

  useEffect(() => {
    if (selectedJobId) {
      fetchMetrics(selectedJobId);
    } else {
      setMetrics(null);
    }
  }, [selectedJobId]);

  const pollJob = useCallback(async (jobId: string) => {
    setIsPolling(true);
    setPollingStatus("PENDING");
    setPollingMessage("Job queued...");

    const poll = async () => {
      try {
        const job = await api.get<MlJobResponse>(`/api/ml/jobs/${jobId}`);
        setPollingStatus(job.status);
        setPollingMessage(job.message || job.status);

        if (job.status === "COMPLETED") {
          setIsPolling(false);
          if (selectedCampaign) fetchJobs(selectedCampaign);
          toast.success("Uplift Scoring completed!");
          return;
        } else if (job.status === "FAILED") {
          setIsPolling(false);
          toast.error(`Job failed: ${job.errorMessage || "Unknown error"}`);
          return;
        }

        setTimeout(poll, 3000);
      } catch {
        setIsPolling(false);
        toast.error("Failed to poll job status");
      }
    };

    setTimeout(poll, 2000);
  }, [selectedCampaign]);

  const pollGPRules = useCallback(async (jobId: string) => {
    setIsGPRulesPolling(true);
    setGpRulesPollingStatus("PENDING");
    setGpRulesPollingMessage("Job queued...");

    const poll = async () => {
      try {
        const job = await api.get<MlJobResponse>(`/api/ml/jobs/${jobId}`);
        setGpRulesPollingStatus(job.status);
        setGpRulesPollingMessage(job.message || job.status);

        if (job.status === "COMPLETED") {
          setIsGPRulesPolling(false);
          if (selectedCampaign) fetchJobs(selectedCampaign);
          toast.success("GP Rules Extraction completed!");
          return;
        } else if (job.status === "FAILED") {
          setIsGPRulesPolling(false);
          toast.error(`Job failed: ${job.errorMessage || "Unknown error"}`);
          return;
        }

        setTimeout(poll, 3000);
      } catch {
        setIsGPRulesPolling(false);
        toast.error("Failed to poll GP Rules job status");
      }
    };

    setTimeout(poll, 2000);
  }, [selectedCampaign]);

  const triggerJob = async (jobType: "UPLIFT_SCORING" | "GP_RULE_EXTRACTION") => {
    if (!selectedCampaign) {
      toast.error("Please select a campaign first");
      return;
    }

    try {
      const body: CreateMlJobRequest = {
        jobType,
        campaignId: selectedCampaign,
        modelVersion: "v1",
        inputParams: {
          top_k_rate: 0.2,
          n_estimators: 100,
        },
      };

      if (jobType === "GP_RULE_EXTRACTION") {
        const upliftJobs = jobs.filter(j => j.jobType === "UPLIFT_SCORING" && j.status === "COMPLETED");
        if (upliftJobs.length > 0) {
          body.upliftScoreJobId = upliftJobs[0].id;
        }
      }

      const job = await api.post<MlJobResponse>("/api/ml/jobs", body);

      if (jobType === "UPLIFT_SCORING") {
        pollJob(job.id);
      } else {
        pollGPRules(job.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to trigger job";
      toast.error(message);
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const variants: Record<JobStatus, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      RUNNING: "default",
      COMPLETED: "outline",
      FAILED: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const hasUpliftJob = jobs.some(j => j.jobType === "UPLIFT_SCORING");
  const lastUpliftJob = jobs.find(j => j.jobType === "UPLIFT_SCORING");
  const canRunGPRules = lastUpliftJob?.status === "COMPLETED";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ML Jobs</h1>
        <p className="text-muted-foreground">Trigger and monitor machine learning pipelines</p>
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
          <CardTitle>Trigger ML Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPolling && (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
              <span className="animate-spin text-lg">⟳</span>
              <span className="text-sm">
                {getStatusBadge(pollingStatus)} {pollingMessage}
              </span>
            </div>
          )}

          {isGPRulesPolling && (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
              <span className="animate-spin text-lg">⟳</span>
              <span className="text-sm">
                {getStatusBadge(gpRulesPollingStatus)} {gpRulesPollingMessage}
              </span>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={() => triggerJob("UPLIFT_SCORING")}
              disabled={!selectedCampaign || isPolling}
            >
              {hasUpliftJob ? "Re-run Uplift Scoring" : "Run Uplift Scoring"}
            </Button>

            <Button
              variant="outline"
              onClick={() => triggerJob("GP_RULE_EXTRACTION")}
              disabled={!selectedCampaign || isGPRulesPolling || !canRunGPRules}
            >
              Run GP Rules Extraction
            </Button>
          </div>

          {hasUpliftJob && lastUpliftJob?.status !== "COMPLETED" && !canRunGPRules && (
            <p className="text-sm text-muted-foreground">
              Complete Uplift Scoring before running GP Rules Extraction
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ML Jobs History</CardTitle>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono text-sm">{job.id}</TableCell>
                    <TableCell>{job.jobType}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>{job.modelVersion || "-"}</TableCell>
                    <TableCell>{new Date(job.createdAt).toLocaleString("en-US", { timeZone: "UTC" })}</TableCell>
                    <TableCell>{job.startedAt ? new Date(job.startedAt).toLocaleString("en-US", { timeZone: "UTC" }) : "-"}</TableCell>
                    <TableCell>{job.completedAt ? new Date(job.completedAt).toLocaleString("en-US", { timeZone: "UTC" }) : "-"}</TableCell>
                    <TableCell>
                      {job.jobType === "UPLIFT_SCORING" && job.status === "COMPLETED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedJobId(job.id)}
                        >
                          View Metrics
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedJobId && (
        <Card>
          <CardHeader>
            <CardTitle>Job Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading metrics...</div>
            ) : metrics ? (
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground">
                  Job ID: {metrics.jobId} | Model Version: {metrics.modelVersion || "N/A"}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">No metrics available</div>
            )}
          </CardContent>
        </Card>
      )}

      {metrics && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Uplift Curve</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.upliftCurve && metrics.upliftCurve.length > 0 ? (
                <UpliftCurveChart data={metrics.upliftCurve} />
              ) : (
                <div className="py-8 text-center text-muted-foreground">No uplift curve data available</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Qini Curve</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.qiniCurve && metrics.qiniCurve.length > 0 ? (
                <QiniCurveChart data={metrics.qiniCurve} />
              ) : (
                <div className="py-8 text-center text-muted-foreground">No Qini curve data available</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Economic Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.economicComparison ? (
                <EconomicComparisonChart data={metrics.economicComparison} />
              ) : (
                <div className="py-8 text-center text-muted-foreground">No economic comparison data available</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}