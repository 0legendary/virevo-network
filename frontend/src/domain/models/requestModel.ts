export interface RequestModel<T> {
    requestId: string;  // Unique ID for tracking
    timestamp: string;  // ISO Timestamp
    requestData: T;     // Dynamic Data (Can be anything)
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
  }
  