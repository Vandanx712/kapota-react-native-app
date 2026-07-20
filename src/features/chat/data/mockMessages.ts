import type { ChatMessage } from "../types/chat.types";

export const mockMessages: ChatMessage[] = [
  {
    id: "1",
    text: "Hey! Are we still on for the meeting today?",
    senderId: "other",
    timestamp: "10:24 AM",
    isOwn: false,
    status: "read",
  },
  {
    id: "2",
    text: "Yes, absolutely. I'll be there at 2 PM.",
    senderId: "me",
    timestamp: "10:25 AM",
    isOwn: true,
    status: "read",
  },
  {
    id: "3",
    text: "Perfect! I wanted to share the venue photos with you.",
    senderId: "other",
    timestamp: "10:26 AM",
    isOwn: false,
    status: "read",
  },
  {
    id: "4",
    text: "Looks amazing! The lighting is perfect for the event.",
    senderId: "other",
    timestamp: "10:26 AM",
    isOwn: false,
    status: "read",
    image: {
      url: "https://images.unsplash.com/photo-1519167758481-83f550bb4b5c?w=400&h=300&fit=crop",
      key: "venue-photo",
    },
  },
  {
    id: "5",
    text: "Wow, this looks incredible! Can't wait to see it in person.",
    senderId: "me",
    timestamp: "10:28 AM",
    isOwn: true,
    status: "read",
  },
  {
    id: "6",
    text: "I'll send over the final guest list by end of day.",
    senderId: "other",
    timestamp: "10:30 AM",
    isOwn: false,
    status: "read",
  },
];
