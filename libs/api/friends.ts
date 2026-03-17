type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
};

type ApiErrorPayload = {
  message?: string | string[];
};

export type UserSummary = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
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

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function searchUsers(
  search: string
): Promise<UserSummary[]> {
  const response = await fetch(
    `${API_BASE_URL}/users?search=${encodeURIComponent(search)}`
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as ApiSuccessResponse<UserSummary[]>;
  return payload.data ?? [];
}

export async function fetchFriends(token: string): Promise<UserSummary[]> {
  const response = await fetch(`${API_BASE_URL}/friends`, {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as ApiSuccessResponse<UserSummary[]>;
  return payload.data ?? [];
}

export async function fetchIncomingRequests(
  token: string
): Promise<UserSummary[]> {
  const response = await fetch(`${API_BASE_URL}/friends/requests/incoming`, {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as ApiSuccessResponse<UserSummary[]>;
  return payload.data ?? [];
}

export async function fetchOutgoingRequests(
  token: string
): Promise<UserSummary[]> {
  const response = await fetch(`${API_BASE_URL}/friends/requests/outgoing`, {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as ApiSuccessResponse<UserSummary[]>;
  return payload.data ?? [];
}

export async function sendFriendRequest(
  token: string,
  recipientId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/friends/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token)
    },
    body: JSON.stringify({ recipientId })
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function cancelFriendRequest(
  token: string,
  recipientId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/friends/requests/${recipientId}`,
    {
      method: 'DELETE',
      headers: authHeaders(token)
    }
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function acceptFriendRequest(
  token: string,
  requesterId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/friends/requests/${requesterId}/accept`,
    {
      method: 'POST',
      headers: authHeaders(token)
    }
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function rejectFriendRequest(
  token: string,
  requesterId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/friends/requests/${requesterId}/reject`,
    {
      method: 'POST',
      headers: authHeaders(token)
    }
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function fetchChatHistory(
  token: string,
  friendId: string,
  limit: number = 50,
  before?: { before: string; beforeId: string }
) {
  const params = new URLSearchParams({
    friendId,
    limit: String(limit)
  });
  if (before) {
    params.set('before', before.before);
    params.set('beforeId', before.beforeId);
  }
  const response = await fetch(`${API_BASE_URL}/chat/history?${params}`, {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as ApiSuccessResponse<{
    items: {
      id: string;
      fromUserId: string;
      toUserId: string;
      body: string;
      sentAt: string;
    }[];
    nextCursor: { before: string; beforeId: string } | null;
  }>;
  return payload.data ?? { items: [], nextCursor: null };
}
