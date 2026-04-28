import {
  AuthSession,
  BorrowerProfile,
  CollectionQueueItem,
  LoanQueueItem,
  PaymentRecord,
  SalesLead,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  token?: string;
  body?: unknown;
  isFormData?: boolean;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", token, body, isFormData } = options;

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? (body as BodyInit) : JSON.stringify(body)) : undefined,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Request failed");
  }

  return payload.data as T;
}

export async function signupUser(input: { name: string; email: string; password: string }) {
  return request<{ id: string; name: string; email: string; role: string }>("/auth/signup", {
    method: "POST",
    body: input,
  });
}

export async function loginUser(input: { email: string; password: string }) {
  return request<AuthSession>("/auth/login", {
    method: "POST",
    body: input,
  });
}

export async function getBorrowerProfile(token: string) {
  return request<BorrowerProfile>("/borrower/profile", { token });
}

export async function savePersonalDetails(
  token: string,
  input: {
    name: string;
    pan: string;
    dob: string;
    monthlySalary: number;
    employmentMode: "salaried" | "self_employed" | "unemployed";
  }
) {
  return request<{ breStatus: "passed" | "failed" }>("/borrower/personal", {
    method: "POST",
    token,
    body: input,
  });
}

export async function uploadSalarySlip(token: string, file: File) {
  const formData = new FormData();
  formData.append("salarySlip", file);

  return request<{ salarySlipUrl: string }>("/borrower/upload", {
    method: "POST",
    token,
    body: formData,
    isFormData: true,
  });
}

export async function applyForLoan(token: string, input: { amount: number; tenure: number }) {
  return request<LoanQueueItem>("/borrower/apply", {
    method: "POST",
    token,
    body: input,
  });
}

export async function getBorrowerLoan(token: string) {
  return request<LoanQueueItem>("/borrower/loan", { token });
}

export async function getBorrowerPaymentHistory(token: string, loanId: string) {
  return request<{ loanId: string; payments: PaymentRecord[] }>(`/borrower/loan/${loanId}/payments`, {
    token,
  });
}

export async function getSalesLeads(token: string) {
  return request<SalesLead[]>("/executive/sales", { token });
}

export async function getSanctionQueue(token: string) {
  return request<LoanQueueItem[]>("/executive/sanction", { token });
}

export async function approveLoan(token: string, loanId: string) {
  return request<LoanQueueItem>(`/executive/sanction/${loanId}/approve`, {
    method: "PATCH",
    token,
  });
}

export async function rejectLoan(token: string, loanId: string, rejectionReason: string) {
  return request<LoanQueueItem>(`/executive/sanction/${loanId}/reject`, {
    method: "PATCH",
    token,
    body: { rejectionReason },
  });
}

export async function getDisbursementQueue(token: string) {
  return request<LoanQueueItem[]>("/executive/disbursement", { token });
}

export async function disburseLoan(token: string, loanId: string) {
  return request<LoanQueueItem>(`/executive/disbursement/${loanId}/disburse`, {
    method: "PATCH",
    token,
  });
}

export async function getCollectionQueue(token: string) {
  return request<CollectionQueueItem[]>("/executive/collection", { token });
}

export async function getCollectionPaymentHistory(token: string, loanId: string) {
  return request<{ loanId: string; borrowerId: string; totalRepayment: number; payments: PaymentRecord[] }>(
    `/executive/collection/${loanId}/payments`,
    { token }
  );
}

export async function recordPayment(
  token: string,
  loanId: string,
  input: { utr: string; amount: number; paymentDate: string }
) {
  return request<{ loanId: string; outstanding: number; status: string }>(
    `/executive/collection/${loanId}/payment`,
    {
      method: "POST",
      token,
      body: input,
    }
  );
}
