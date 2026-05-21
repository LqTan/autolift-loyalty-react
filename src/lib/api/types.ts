export type VoucherType = "DISCOUNT_PERCENTAGE" | "DISCOUNT_FIXED_AMOUNT" | "FREE_SHIPPING" | "BUY_X_GET_Y";
export type VoucherStatus = "ACTIVE" | "USED" | "EXPIRED" | "CANCELLED";

export interface CreateVoucherRequest {
  code: string;
  campaignId?: string;
  type?: string;
  value?: number;
  minOrderAmount?: number;
  maxUsage?: number;
  validFrom?: string;
  validUntil?: string;
}

export interface CreateVoucherResult {
  id: string;
  code: string;
  campaignId: string;
  type: VoucherType;
  value: number;
  minOrderAmount: number;
  maxUsage: number;
  usedCount: number;
  status: VoucherStatus;
  validFrom: string;
  validUntil: string;
}

export interface RedeemVoucherRequest {
  customerId: string;
}

export interface ImportResult {
  campaignId: string;
  recordsImported: number;
  type: string;
}

export interface CreateSandboxRequest {
  name: string;
}

export interface SandboxCreatedResult {
  id: string;
  name: string;
}

export interface CreatePromotionRequest {
  name: string;
  description?: string;
  promotionType: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderAmount?: number;
  applicableCustomerSegment?: string;
  startDate: string;
  endDate: string;
}

export interface CreatePromotionResult {
  id: string;
  name: string;
  description?: string;
  promotionType: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderAmount?: number;
  applicableCustomerSegment?: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface CreateNotificationRequest {
  eventType: string;
  channel?: string;
  recipient: string;
  subject: string;
  body: string;
  payload?: Record<string, unknown>;
}

export interface NotificationCommandResponse {
  id: string;
  status: string;
}

export type JobType = "UPLIFT_SCORING" | "GP_RULE_EXTRACTION";
export type JobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface CreateMlJobRequest {
  jobType: JobType;
  campaignId: string;
  modelVersion?: string;
  inputParams?: Record<string, unknown>;
  upliftScoreJobId?: string;
}

export interface MlJobResponse {
  id: string;
  jobType: JobType;
  campaignId: string;
  status: JobStatus;
  modelVersion?: string;
  inputParams?: Record<string, unknown>;
  resultPath?: string;
  errorMessage?: string;
  upliftScoreJobId?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progress?: number;
  message?: string;
}

export interface CreateLoyaltyAccountRequest {
  customerId: string;
}

export interface LoyaltyAccountCreatedResult {
  id: string;
  customerId: string;
  pointsBalance: number;
  tier: string;
  status: string;
  createdAt: string;
}

export interface UsePointsRequest {
  amount: number;
  referenceId?: string;
}

export interface AddPointsRequest {
  amount: number;
  referenceId?: string;
}

export type CustomerSegment = "VIP" | "NORMAL" | "NEW";

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  segment?: CustomerSegment;
}

export interface CreateCustomerResult {
  id: string;
  name: string;
  email: string;
  phone?: string;
  segment: CustomerSegment;
  status: string;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budgetAmount?: number;
  budgetCurrency?: string;
}

export interface CampaignCreatedResult {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  budgetCurrency: string;
}

export interface CampaignActivatedResponse {
  campaignId: string;
  name: string;
  activatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
}

export interface VoucherResponse {
  id: string;
  code: string;
  campaignId: string;
  type: string;
  value: number;
  minOrderAmount: number;
  maxUsage: number;
  usedCount: number;
  status: VoucherStatus;
  validFrom: string;
  validUntil: string;
}

export interface CustomerFeatureResponse {
  customerId: string;
  recencyDays: number;
  frequency90d: number;
  monetary90d: number;
  avgBasketValue: number;
  totalQuantity90d: number;
  uniqueProductCount: number;
  uniqueCategoryCount: number;
  favoriteCategory: string;
  featureVersion: string;
  createdAt: string;
}

export type TargetSegment = "PERSUADABLE" | "NEUTRAL" | "DO_NOT_TARGET";

export interface TargetCustomerResponse {
  customerId: string;
  upliftScore: number;
  segment: TargetSegment;
  treatmentProbability: number;
  controlProbability: number;
}

export interface SandboxResponse {
  id: string;
  name: string;
}

export interface PromotionView {
  id: string;
  name: string;
  description?: string;
  promotionType: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderAmount?: number;
  applicableCustomerSegment?: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationView {
  id: string;
  eventType: string;
  channel: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  payload?: Record<string, unknown>;
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

export interface LoyaltyAccountResponse {
  id: string;
  customerId: string;
  pointsBalance: number;
  tier: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GpRuleView {
  id: string;
  campaignId: string;
  ruleText: string;
  ruleExpression: string;
  targetLabel: string;
  precisionValue: number;
  recallValue: number;
  f1Score: number;
  accuracyValue: number;
  coverageValue: number;
  modelVersion: string;
  sourceFile: string;
  createdAt: string;
}

export interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  segment: string;
  status: string;
}

export interface CampaignResponse {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  budgetCurrency: string;
}

export interface GenerateTestCampaignsRequest {
  count: number;
}

export interface TestCampaignResult {
  id: string;
  name: string;
  status: string;
}

export interface GenerateTestCampaignsResponse {
  generated: number;
  campaigns: TestCampaignResult[];
}

export interface CampaignBatchItem {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budgetAmount?: number;
  budgetCurrency?: string;
}

export interface CreateBatchCampaignsRequest {
  campaigns: CampaignBatchItem[];
}

export interface BatchCampaignResult {
  id: string;
  name: string;
  status: string;
}

export interface CreateBatchCampaignsResponse {
  created: BatchCampaignResult[];
}