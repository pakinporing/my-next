import { testApi } from '../action';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
};

type ApiErrorPayload = {
  message?: string | string[];
};

export type LoginUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

type LoginResponseData = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  user: LoginUser;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:8888';

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    if (Array.isArray(payload.message)) return payload.message.join(', ');
    if (payload.message) return payload.message;
  } catch {
    return 'Unexpected error occurred';
  }

  return 'Request failed';
}

export async function requestLogin(
  email: string,
  password: string
): Promise<LoginResponseData> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload =
    (await response.json()) as ApiSuccessResponse<LoginResponseData>;
  if (!payload?.data?.user || !payload?.data?.accessToken) {
    throw new Error('Invalid login response');
  }

  return payload.data;
}

export async function requestRefresh(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  console.log('res requestRefresh ===> ', response);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as ApiSuccessResponse<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
  }>;
  return payload.data;
}

export async function requestLogout(refreshToken: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function requestRegister(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: Gender;
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function testApiRequest() {
  const response = await testApi();
  console.log('res testApiRequest ===> ', response);
}
