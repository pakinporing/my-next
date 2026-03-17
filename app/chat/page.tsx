'use client';

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  acceptFriendRequest,
  cancelFriendRequest,
  fetchFriends,
  fetchIncomingRequests,
  fetchOutgoingRequests,
  fetchChatHistory,
  searchUsers,
  sendFriendRequest,
  rejectFriendRequest,
  type UserSummary
} from '@/libs/api/friends';

type ChatMessage = {
  id: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  sentAt: string;
};

type Sticker = {
  id: string;
  emoji: string;
  label: string;
};

type AvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md';
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:8888';

const STICKERS: Sticker[] = [
  { id: 'happy', emoji: '😄', label: 'Happy' },
  { id: 'love', emoji: '🥰', label: 'Love' },
  { id: 'wow', emoji: '😲', label: 'Wow' },
  { id: 'ok', emoji: '👌', label: 'OK' },
  { id: 'lol', emoji: '😂', label: 'LOL' },
  { id: 'bye', emoji: '👋', label: 'Bye' }
];

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  const result = `${first}${last}`.toUpperCase();
  return result || 'U';
}

function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  const dimension = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const sizePx = size === 'sm' ? 32 : 40;
  return imageUrl ? (
    <Image
      src={imageUrl}
      alt={name}
      width={sizePx}
      height={sizePx}
      className={`${dimension} rounded-full object-cover shadow`}
    />
  ) : (
    <div
      className={`${dimension} flex items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow`}
      aria-label={name}
    >
      {initialsFromName(name)}
    </div>
  );
}

function isSticker(body: string) {
  return body.startsWith('[[sticker:') && body.endsWith(']]');
}

function stickerFromBody(body: string) {
  const id = body.replace('[[sticker:', '').replace(']]', '').trim();
  return STICKERS.find((sticker) => sticker.id === id);
}

export default function ChatPage() {
  const { data: session } = useSession();
  const apiToken = session?.apiToken;
  const currentUserId = session?.user?.id;
  const [selfAvatarUrl, setSelfAvatarUrl] = useState<string | null>(null);
  const currentUserImage = selfAvatarUrl ?? session?.user?.image ?? null;
  const currentUserName = session?.user?.name ?? 'You';

  const [friends, setFriends] = useState<UserSummary[]>([]);
  const [incoming, setIncoming] = useState<UserSummary[]>([]);
  const [outgoing, setOutgoing] = useState<UserSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<UserSummary | null>(
    null
  );
  const [messageDraft, setMessageDraft] = useState('');
  const [messagesByFriend, setMessagesByFriend] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [historyCursorByFriend, setHistoryCursorByFriend] = useState<
    Record<string, { before: string; beforeId: string } | null>
  >({});
  const [historyHasMoreByFriend, setHistoryHasMoreByFriend] = useState<
    Record<string, boolean>
  >({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [chatStatus, setChatStatus] = useState<'offline' | 'online'>('offline');
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [stickerOpen, setStickerOpen] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);

  const currentMessages = useMemo(() => {
    if (!selectedFriend) return [];
    return messagesByFriend[selectedFriend.id] ?? [];
  }, [messagesByFriend, selectedFriend]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !selectedFriend) return;
    const timer = setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 0);
    return () => clearTimeout(timer);
  }, [currentMessages.length, selectedFriend]);

  const refreshFriends = useCallback(async () => {
    if (!apiToken) return;
    setFriendsError(null);
    try {
      const [friendsData, incomingData, outgoingData] = await Promise.all([
        fetchFriends(apiToken),
        fetchIncomingRequests(apiToken),
        fetchOutgoingRequests(apiToken)
      ]);
      setFriends(friendsData);
      setIncoming(incomingData);
      setOutgoing(outgoingData);
    } catch (error) {
      setFriendsError(
        error instanceof Error ? error.message : 'Request failed'
      );
    }
  }, [apiToken]);

  useEffect(() => {
    if (!apiToken) return;
    const timer = setTimeout(() => {
      void refreshFriends();
    }, 0);
    return () => clearTimeout(timer);
  }, [apiToken, refreshFriends]);

  useEffect(() => {
    if (!apiToken) return;
    const socket = io(`${API_BASE_URL}/chat`, {
      auth: { token: apiToken }
    });
    socketRef.current = socket;

    socket.on('connect', () => setChatStatus('online'));
    socket.on('disconnect', () => setChatStatus('offline'));
    socket.on('chat:message', (message: ChatMessage) => {
      const friendId =
        message.fromUserId === currentUserId
          ? message.toUserId
          : message.fromUserId;

      setMessagesByFriend((prev) => ({
        ...prev,
        [friendId]: [...(prev[friendId] ?? []), message]
      }));
    });
    socket.on('exception', (payload: { message?: string }) => {
      if (payload?.message) {
        setChatError(payload.message);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [apiToken, currentUserId]);

  useEffect(() => {
    if (!apiToken) return;
    const controller = new AbortController();
    const loadSelf = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${apiToken}`
          },
          signal: controller.signal
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          data?: { avatarUrl?: string | null };
        };
        setSelfAvatarUrl(payload.data?.avatarUrl ?? null);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    };
    void loadSelf();
    return () => controller.abort();
  }, [apiToken]);

  const runSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }
      setSearchError(null);
      try {
        const results = await searchUsers(query.trim());
        setSearchResults(results);
      } catch (error) {
        setSearchError(
          error instanceof Error ? error.message : 'Search failed'
        );
      }
    },
    [setSearchResults]
  );

  const handleSendRequest = async (userId: string) => {
    if (!apiToken) return;
    setFriendsError(null);
    try {
      await sendFriendRequest(apiToken, userId);
      await refreshFriends();
    } catch (error) {
      setFriendsError(
        error instanceof Error ? error.message : 'Request failed'
      );
    }
  };

  const handleCancelRequest = async (userId: string) => {
    if (!apiToken) return;
    setFriendsError(null);
    try {
      await cancelFriendRequest(apiToken, userId);
      await refreshFriends();
    } catch (error) {
      setFriendsError(
        error instanceof Error ? error.message : 'Request failed'
      );
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    if (!apiToken) return;
    setFriendsError(null);
    try {
      await acceptFriendRequest(apiToken, userId);
      await refreshFriends();
    } catch (error) {
      setFriendsError(
        error instanceof Error ? error.message : 'Request failed'
      );
    }
  };

  const handleRejectRequest = async (userId: string) => {
    if (!apiToken) return;
    setFriendsError(null);
    try {
      await rejectFriendRequest(apiToken, userId);
      await refreshFriends();
    } catch (error) {
      setFriendsError(
        error instanceof Error ? error.message : 'Request failed'
      );
    }
  };

  const handleSendMessage = () => {
    if (!selectedFriend || !messageDraft.trim() || !socketRef.current) return;
    socketRef.current.emit('chat:send', {
      toUserId: selectedFriend.id,
      message: messageDraft.trim()
    });
    setMessageDraft('');
  };

  const handleSendSticker = (stickerId: string) => {
    if (!selectedFriend || !socketRef.current) return;
    socketRef.current.emit('chat:send', {
      toUserId: selectedFriend.id,
      message: `[[sticker:${stickerId}]]`
    });
    setStickerOpen(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim();
      if (!trimmed) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }
      void runSearch(trimmed);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, runSearch]);

  const loadHistory = useCallback(
    async (friend: UserSummary) => {
      if (!apiToken) return;
      setChatError(null);
      try {
        const history = await fetchChatHistory(apiToken, friend.id, 5);
        setMessagesByFriend((prev) => ({
          ...prev,
          [friend.id]: history.items
        }));
        setHistoryCursorByFriend((prev) => ({
          ...prev,
          [friend.id]: history.nextCursor
        }));
        setHistoryHasMoreByFriend((prev) => ({
          ...prev,
          [friend.id]: Boolean(history.nextCursor)
        }));
        const container = messagesContainerRef.current;
        if (container) {
          setTimeout(() => {
            container.scrollTop = container.scrollHeight;
          }, 0);
        }
      } catch (error) {
        setChatError(error instanceof Error ? error.message : 'History failed');
      }
    },
    [apiToken]
  );

  const loadMoreHistory = useCallback(
    async (friend: UserSummary) => {
      if (!apiToken || historyLoading) return;
      const cursor = historyCursorByFriend[friend.id];
      if (!cursor) return;
      if (historyHasMoreByFriend[friend.id] === false) return;

      setHistoryLoading(true);
      setChatError(null);
      const container = messagesContainerRef.current;
      const prevHeight = container?.scrollHeight ?? 0;
      const prevScrollTop = container?.scrollTop ?? 0;
      try {
        const history = await fetchChatHistory(apiToken, friend.id, 5, cursor);
        setMessagesByFriend((prev) => ({
          ...prev,
          [friend.id]: [...history.items, ...(prev[friend.id] ?? [])]
        }));
        setHistoryCursorByFriend((prev) => ({
          ...prev,
          [friend.id]: history.nextCursor
        }));
        setHistoryHasMoreByFriend((prev) => ({
          ...prev,
          [friend.id]: Boolean(history.nextCursor)
        }));
        if (container) {
          setTimeout(() => {
            const newHeight = container.scrollHeight;
            container.scrollTop = newHeight - prevHeight + prevScrollTop;
          }, 0);
        }
      } catch (error) {
        setChatError(error instanceof Error ? error.message : 'History failed');
      } finally {
        setHistoryLoading(false);
      }
    },
    [apiToken, historyCursorByFriend, historyHasMoreByFriend, historyLoading]
  );

  useEffect(() => {
    if (!selectedFriend && friends.length > 0) {
      const timer = setTimeout(() => {
        setSelectedFriend(friends[0]);
        void loadHistory(friends[0]);
      }, 0);
      return () => clearTimeout(timer);
    }
    return;
  }, [friends, selectedFriend, loadHistory]);

  useEffect(() => {
    if (!selectedFriend) return;
    const root = messagesContainerRef.current;
    const target = topSentinelRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMoreHistory(selectedFriend);
        }
      },
      {
        root,
        rootMargin: '120px 0px 0px 0px',
        threshold: 0.1
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [selectedFriend, loadMoreHistory]);

  if (!apiToken) {
    return (
      <main className="min-h-screen bg-[#f4f5f7] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_14px_40px_rgba(15,23,42,0.12)]">
          <h1 className="text-2xl font-black text-slate-900">LINE Chat</h1>
          <p className="mt-2 text-sm text-slate-600">
            Please sign in to access friends and chat.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[320px_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.12)]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-[#06C755] px-5 py-4 text-white">
            <h2 className="text-lg font-black">Add Friends</h2>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              {chatStatus}
            </span>
          </div>

          <div className="p-5">
            <div className="space-y-3">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name"
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#06C755] focus:ring-2 focus:ring-[#06C755]/20"
              />
              <button
                onClick={() => void runSearch(searchQuery)}
                className="w-full rounded-full bg-[#06C755] px-4 py-3 text-sm font-semibold text-white hover:bg-[#05b24d]"
              >
                Search
              </button>
            </div>

            {friendsError ? (
              <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {friendsError}
              </p>
            ) : null}
            {searchError ? (
              <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {searchError}
              </p>
            ) : null}

            <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search Results
              </p>
              {searchResults.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No results yet.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={`${user.firstName} ${user.lastName}`}
                          imageUrl={user.avatarUrl}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user.id)}
                        className="rounded-full border border-[#06C755]/40 px-3 py-1 text-xs font-semibold text-[#06C755] hover:bg-[#06C755]/10"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Incoming Requests
              </p>
              {incoming.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  No incoming requests.
                </p>
              ) : (
                <div className="mt-2 space-y-2">
                  {incoming.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={`${user.firstName} ${user.lastName}`}
                          imageUrl={user.avatarUrl}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(user.id)}
                          className="rounded-full bg-[#06C755] px-3 py-1 text-xs font-semibold text-white hover:bg-[#05b24d]"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(user.id)}
                          className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Outgoing Requests
              </p>
              {outgoing.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  No outgoing requests.
                </p>
              ) : (
                <div className="mt-2 space-y-2">
                  {outgoing.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={`${user.firstName} ${user.lastName}`}
                          imageUrl={user.avatarUrl}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancelRequest(user.id)}
                        className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>
        </section>

        <section className="flex h-[calc(100vh-240px)] max-h-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.12)]">
          <header className="flex items-center justify-between border-b border-slate-200 bg-[#06C755] px-6 py-4 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                LINE Chat
              </p>
              <h2 className="text-xl font-black">
                {selectedFriend
                  ? `${selectedFriend.firstName} ${selectedFriend.lastName}`
                  : 'Select a friend'}
              </h2>
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              {friends.length} friends
            </span>
          </header>

          <div className="flex flex-1 overflow-hidden">
            <aside className="w-64 border-r border-slate-200 bg-[#f7f8fa] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Friends
              </p>
              <div className="mt-3 space-y-2">
                {friends.length === 0 ? (
                  <p className="text-sm text-slate-500">No friends yet.</p>
                ) : (
                  friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => {
                        setSelectedFriend(friend);
                        void loadHistory(friend);
                        setMessageDraft('');
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-semibold transition ${
                        selectedFriend?.id === friend.id
                          ? 'bg-[#06C755] text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Avatar
                        name={`${friend.firstName} ${friend.lastName}`}
                        imageUrl={friend.avatarUrl}
                        size="sm"
                      />
                      <span>
                        {friend.firstName} {friend.lastName}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <div className="flex flex-1 flex-col">
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto bg-white px-6 py-6"
              >
                {chatError ? (
                  <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {chatError}
                  </p>
                ) : null}
                {selectedFriend ? (
                  currentMessages.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Start the conversation. Messages appear here in real time.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div ref={topSentinelRef} />
                      {historyLoading ? (
                        <p className="text-center text-xs text-slate-400">
                          Loading older messages...
                        </p>
                      ) : null}
                      {currentMessages.map((message) => {
                        const isMine = message.fromUserId === currentUserId;
                        return (
                          <div
                            key={message.id}
                            className={`flex items-end gap-3 ${
                              isMine ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {!isMine && selectedFriend ? (
                              <Avatar
                                name={`${selectedFriend.firstName} ${selectedFriend.lastName}`}
                                imageUrl={selectedFriend.avatarUrl}
                                size="sm"
                              />
                            ) : null}
                            <div
                              className={`max-w-xs rounded-2xl px-4 py-3 text-sm shadow ${
                                isMine
                                  ? 'bg-[#06C755] text-white'
                                  : 'bg-[#f2f3f5] text-slate-800'
                              }`}
                            >
                              {isSticker(message.body) ? (
                                <div className="text-3xl">
                                  {stickerFromBody(message.body)?.emoji ?? '❓'}
                                </div>
                              ) : (
                                <p>{message.body}</p>
                              )}
                              <p className="mt-1 text-[10px] uppercase tracking-wide opacity-70">
                                {new Date(message.sentAt).toLocaleTimeString()}
                              </p>
                            </div>
                            {isMine ? (
                              <Avatar
                                name={currentUserName}
                                imageUrl={currentUserImage}
                                size="sm"
                              />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <p className="text-sm text-slate-500">
                    Pick a friend from the left to start chatting.
                  </p>
                )}
              </div>

              <div className="border-t border-slate-200 bg-[#f7f8fa] px-6 py-4">
                <div className="relative mb-3">
                  <button
                    onClick={() => setStickerOpen((prev) => !prev)}
                    disabled={!selectedFriend}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-50"
                  >
                    <span className="text-lg">😊</span>
                    Stickers
                  </button>
                  {stickerOpen ? (
                    <div className="absolute bottom-[48px] left-0 z-10 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Choose a sticker
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {STICKERS.map((sticker) => (
                          <button
                            key={sticker.id}
                            onClick={() => handleSendSticker(sticker.id)}
                            className="rounded-xl border border-slate-200 bg-white py-2 text-2xl shadow-sm hover:bg-slate-100"
                            title={sticker.label}
                          >
                            {sticker.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <input
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    placeholder="Write a message..."
                    disabled={!selectedFriend}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#06C755] focus:ring-2 focus:ring-[#06C755]/20 disabled:bg-slate-100"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!selectedFriend}
                    className="rounded-full bg-[#06C755] px-5 py-3 text-sm font-semibold text-white hover:bg-[#05b24d] disabled:opacity-60"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
