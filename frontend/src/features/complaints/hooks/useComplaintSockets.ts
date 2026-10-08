import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { createSocket } from "../../../config/socket";
import { useAppSelector } from "../../../store/hooks";
import type { Comment, Complaint, ComplaintEvent } from "../../../types";
import { labelOf, STATUSES } from "../../../utils/constants";

export type CommentEventData = Comment & { userId: number; residentId: number; title: string };
export type SocketPayload = Partial<Complaint> & Partial<CommentEventData>;

export function useComplaintSockets(onChange?: (event: ComplaintEvent, payload: SocketPayload) => void) {
  const user = useAppSelector((s) => s.auth.user);
  const handler = useRef(onChange);
  handler.current = onChange;

  useEffect(() => {
    if (!user) return undefined;
    const socket = createSocket();

    socket.on("complaint.created", (data: Complaint) => {
      if (user.role === "admin") toast(`New complaint from ${data.residentName}: ${data.title}`, { icon: "📣" });
      handler.current?.("created", data);
    });
    socket.on("complaint.updated", (data: Complaint) => {
      if (data.residentId === user.id) toast(`Your complaint "${data.title}" is now ${labelOf(STATUSES, data.status).toLowerCase()}.`, { icon: "🔔" });
      handler.current?.("updated", data);
    });
    socket.on("complaint.commented", (data: CommentEventData) => {
      if (data.userId !== user.id) toast(`${data.authorName} commented on "${data.title}".`, { icon: "💬" });
      handler.current?.("commented", data);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);
}
