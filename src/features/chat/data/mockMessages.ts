import type { ChatMessage } from "../types/chat.types";

const conversationId = "demo";

export const mockMessages: ChatMessage[] = [
  {
    _id: "1",
    conversationId,
    createdAt: "2026-01-01T10:24:00.000Z",
    sender: "other",
    text: "Hey! Are we still on for the meeting today?",
  },
  {
    _id: "2",
    conversationId,
    createdAt: "2026-01-01T10:25:00.000Z",
    sender: "me",
    text: "Yes, absolutely. I'll be there at 2 PM.",
  },
  {
    _id: "3",
    conversationId,
    createdAt: "2026-01-01T10:26:00.000Z",
    sender: "other",
    text: "Perfect! I wanted to share the venue photos with you.",
  },
  {
    _id: "4",
    conversationId,
    createdAt: "2026-01-01T10:26:30.000Z",
    image: {
      key: "venue-photo",
      url: "https://images.unsplash.com/photo-1519167758481-83f550bb4b5c?w=400&h=300&fit=crop",
    },
    sender: "other",
    text: "Looks amazing! The lighting is perfect for the event.",
  },
  {
    _id: "5",
    conversationId,
    createdAt: "2026-01-01T10:28:00.000Z",
    sender: "me",
    text: "Wow, this looks incredible! Can't wait to see it in person.",
  },
  {
    _id: "6",
    conversationId,
    createdAt: "2026-01-01T10:30:00.000Z",
    sender: "other",
    text: "I'll send over the final guest list by end of day.",
  },
];
