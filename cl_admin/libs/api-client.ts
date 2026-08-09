const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  info: unknown;

  constructor(message: string, status: number, info: unknown) {
    super(message);
    this.status = status;
    this.info = info;
    this.name = 'ApiError';
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, body, ...customConfig } = options;
  
  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryStr = searchParams.toString();
    if (queryStr) {
      url += `?${queryStr}`;
    }
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // If body is FormData, delete Content-Type to let browser set it automatically with boundary
  if (body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
  };

  if (body && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  } else if (body) {
    config.body = body as BodyInit;
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorInfo: unknown;
    try {
      errorInfo = await response.json();
    } catch {
      errorInfo = await response.text();
    }
    const message = (errorInfo && typeof errorInfo === 'object' && 'message' in errorInfo)
      ? String((errorInfo as { message: unknown }).message)
      : `HTTP error! Status: ${response.status}`;
    throw new ApiError(
      message,
      response.status,
      errorInfo
    );
  }

  // Handle stream responses or empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/event-stream')) {
    return response as unknown as T;
  }

  if (response.status === 204) {
    return {} as T;
  }

  try {
    return await response.json() as T;
  } catch {
    return {} as T;
  }
}
