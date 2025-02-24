export interface Notification {
    id: number;
    avatar: string;
    author: string;
    content: string;
    time: string;
    type: 'message' | 'follow' | 'like' | 'mention' | 'video';
  }