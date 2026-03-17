export class ApiError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}
