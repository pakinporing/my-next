type ApiErrorPayload = {
  message?: string | string[];
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

export async function requestForgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function requestResetPassword(
  token: string,
  password: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password })
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}
