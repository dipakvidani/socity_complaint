import { useEffect, useRef } from "react";
import toast from "../../../utils/toast";
import { createSocket } from "../../../config/socket";
import { useAppSelector } from "../../../store/hooks";
import type { Comment, Complaint, ComplaintEvent } from "../../../types";
import { labelOf, STATUSES } from "../../../utils/constants";

export type CommentEventData = Comment & { userId: number; residentId: number; title: string };
export type SocketPayload = Partial<Complaint> & Partial<CommentEventData>;

const trimTitle = (title: string, maxLen = 35) => (title.length > maxLen ? `${title.slice(0, maxLen)}…` : title);

export function useComplaintSockets(onChange?: (event: ComplaintEvent, payload: SocketPayload) => void) {
  const user = useAppSelector((s) => s.auth.user);
  const handler = useRef(onChange);
  handler.current = onChange;

  useEffect(() => {
    if (!user) return undefined;
    const socket = createSocket();

    socket.on("complaint.created", (data: Complaint) => {
      if (user.role === "admin" && data.residentId !== user.id) {
        toast(`New complaint from ${data.residentName}: "${trimTitle(data.title)}"`, { icon: "📣" });
      }
      handler.current?.("created", data);
    });
    socket.on("complaint.updated", (data: Complaint) => {
      if (data.status === "cancelled") {
        if (user.role === "admin" && data.residentId !== user.id) {
          toast(`Resident ${data.residentName} cancelled "${trimTitle(data.title)}"`, { icon: "🚫" });
        }
      } else {
        if (data.residentId === user.id && user.role !== "admin") {
          toast(`Your complaint "${trimTitle(data.title)}" is now ${labelOf(STATUSES, data.status).toLowerCase()}.`, { icon: "🔔" });
        }
      }
      handler.current?.("updated", data);
    });
    socket.on("complaint.commented", (data: CommentEventData) => {
      if (data.userId !== user.id) toast(`${data.authorName} commented on "${trimTitle(data.title)}"`, { icon: "💬" });
      handler.current?.("commented", data);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);
}
