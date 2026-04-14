import axios from "axios";

// ⚠️ Replace with YOUR actual local IP from ipconfig
const BASE_URL = "http://192.168.29.125:5000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export const reportIssue = (data: FormData, token: string) =>
  api.post("/issues/report", data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

export const getIssues = (token: string) =>
  api.get("/issues", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getIssueById = (id: string, token: string) =>
  api.get(`/issues/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateStatus = (id: string, status: string, token: string) =>
  api.patch(`/issues/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteIssue = (id: string, token: string) =>
  api.delete(`/issues/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });