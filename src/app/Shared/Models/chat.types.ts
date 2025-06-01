import { User } from "./User.model";

export interface Attachment {
    _id?: string;
    type: 'media' | 'doc' | 'link';
    url: string;
    name?: string;
    size?: number;
    mimeType?: string;
    uploadedBy: User;
    uploadedAt: Date;
  }
  
  export interface Message {
    _id?: string;
    chatId?: string;
    senderId: string;
    content: string;
    attachments: Attachment[];
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
export interface Chat {
    _id?: string;
    user: User;
    contact: User;
    lastMessage?: Message;
    unreadCount: Map<string, number>;
    muted: Map<string, boolean>;
    sharedAttachments: {
      attachment: Attachment;
      sharedBy: User;
      sharedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
    messages: Message[];
  }