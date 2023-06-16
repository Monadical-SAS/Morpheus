import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getOrRefreshFirebaseToken } from "@/lib/firebaseClient";
import { logout } from "./users";

const httpInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

httpInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: any) => {
    if (error.response.status === 401) {
      await logout();
    }

    if (error.response.status === 403) {
      alert("you don't have permission to access this resource");
    }

    if (error.response.status === 404) {
      alert("resource not found");
    }

    return Promise.reject(error);
  }
);

httpInstance.interceptors.request.use(
  async (request: AxiosRequestConfig) => {
    const token = await getOrRefreshFirebaseToken();

    if (token) {
      request?.headers &&
        (request.headers["Authorization"] = `Bearer ${token.replaceAll(
          '"',
          ""
        )}`);
    }
    return request;
  },
  (error) => {
    Promise.reject(error);
  }
);

export default httpInstance;
