import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatDate = (value: string): string => dayjs(value).format("DD MMM YYYY, hh:mm A");
export const timeAgo = (value: string): string => dayjs(value).fromNow();
