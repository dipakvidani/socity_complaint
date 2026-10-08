import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { clearUser } from "./authSlice";
import { API_URL } from "../config/api";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api`,
  credentials: "include",
});

const skipRefreshEndpoints = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

let isRefreshing = false;

export const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === "string" ? args : args.url;
  const isSkipRefresh = skipRefreshEndpoints.some((endpoint) => url.includes(endpoint));

  if (result.error && result.error.status === 401 && !isSkipRefresh) {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshResult = await rawBaseQuery(
        { url: "/auth/refresh", method: "POST" },
        api,
        extraOptions
      );
      isRefreshing = false;

      if (refreshResult.data) {
        // Token refreshed successfully, retry the original query
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, user session expired
        api.dispatch(clearUser());
      }
    } else {
      // Retry query after waiting for refresh
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
