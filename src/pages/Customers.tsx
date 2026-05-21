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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { api, type CustomerResponse } from "@/lib/api";
import { toast } from "sonner";

interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  segment?: "NORMAL" | "VIP" | "NEW";
}

interface SeedJobResponse {
  id: string;
  jobType: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  resultPath?: string;
  errorMessage?: string;
}

interface SeedResult {
  imported: number;
  failed: number;
  total: number;
}

interface PaginatedCustomersResponse {
  content: CustomerResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [seedDialogOpen, setSeedDialogOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState<SeedResult | null>(null);
  const [seedPercent, setSeedPercent] = useState(0);
  const [seedStatus, setSeedStatus] = useState<string>("");
  const [formData, setFormData] = useState<CreateCustomerRequest>({
    name: "",
    email: "",
    phone: "",
    segment: "NORMAL",
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

  const fetchCustomers = async () => {
    setIsAnimating(true);
    try {
      const data = await api.get<PaginatedCustomersResponse>(`/api/customers?page=${currentPage}&size=${pageSize}`);
      setTimeout(() => {
        setCustomers(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
        setIsAnimating(false);
      }, 600);
    } catch {
      toast.error("Failed to fetch customers");
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, pageSize]);

  const handleCreate = async () => {
    try {
      await api.post("/api/customers", formData);
      toast.success("Customer created successfully");
      setDialogOpen(false);
      fetchCustomers();
    } catch {
      toast.error("Failed to create customer");
    }
  };

  const handleSeedCustomers = async () => {
    try {
      setSeeding(true);
      setSeedProgress(null);
      setSeedStatus("Starting seed job...");

      const jobResponse = await api.post<{ jobId: string; status: string }>("/api/customers/seed");
      const jobId = jobResponse.jobId;

      setSeedStatus("Importing 0");

      const pollJob = async () => {
        const job = await api.get<SeedJobResponse>(`/api/ml/jobs/${jobId}`);

        if (job.resultPath) {
          const result = JSON.parse(job.resultPath) as SeedResult;
          setSeedProgress(result);
          setSeedPercent(result.total > 0 ? Math.round((result.imported / result.total) * 100) : 0);
          setSeedStatus(`Imported ${result.imported.toLocaleString()}${result.imported > 0 ? ` / ${result.total.toLocaleString()}` : ""}${result.failed > 0 ? `, ${result.failed} failed` : ""}`);
        }

        if (job.status === "PENDING" || job.status === "RUNNING") {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return pollJob();
        }

        if (job.status === "FAILED") {
          setSeedStatus(`Failed: ${job.errorMessage || "Unknown error"}`);
          setSeeding(false);
          return;
        }

        if (job.status === "COMPLETED") {
          setSeedPercent(100);
          setSeedStatus("Seed completed successfully!");
          setSeeding(false);
          setTimeout(() => {
            setSeedDialogOpen(false);
            fetchCustomers();
          }, 1500);
        }
      };

      await pollJob();
    } catch {
      toast.error("Failed to start seed job");
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage customer accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSeedDialogOpen(true)}>
            Seed Customers
          </Button>
          <Button onClick={() => setDialogOpen(true)}>Create Customer</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
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
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">Email</th>
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">Phone</th>
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">Segment</th>
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {customers.length === 0 ? (
                    <tr className="border-b">
                      <td colSpan={5} className="p-2 align-middle text-center py-8 text-muted-foreground">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-2 align-middle font-medium">{customer.name}</td>
                        <td className="p-2 align-middle">{customer.email}</td>
                        <td className="p-2 align-middle">{customer.phone || "-"}</td>
                        <td className="p-2 align-middle">
                          <Badge variant="secondary">{customer.segment}</Badge>
                        </td>
                        <td className="p-2 align-middle">
                          <Badge variant={customer.status === "ACTIVE" ? "default" : "secondary"}>
                            {customer.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {customers.length > 0 && (
              <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements.toLocaleString()} customers
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
            <DialogTitle>Create Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="segment">Segment</Label>
              <Select value={formData.segment} onValueChange={(v) => setFormData({ ...formData, segment: v as CreateCustomerRequest["segment"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={seedDialogOpen} onOpenChange={(open) => {
        if (!seeding) setSeedDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seed Customers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Import customers from the X5 RetailHero dataset (ml/data/clients.csv.gz). This process runs in the background.
            </p>
            {seeding && (
              <div className="space-y-2">
                <Progress value={seedPercent} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span>{seedStatus || "Starting..."}</span>
                  <span className="font-medium">{seedPercent}%</span>
                </div>
              </div>
            )}
            {seedProgress && !seeding && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Imported</span>
                  <span className="font-medium">{seedProgress.imported.toLocaleString()}</span>
                </div>
                {seedProgress.failed > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Failed</span>
                    <span className="font-medium">{seedProgress.failed.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSeedDialogOpen(false)} disabled={seeding}>
              Cancel
            </Button>
            <Button onClick={handleSeedCustomers} disabled={seeding}>
              {seeding ? "Seeding..." : "Start Seed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}