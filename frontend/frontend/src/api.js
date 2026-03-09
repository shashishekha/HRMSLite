const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export const fetcher = async (url, opts = {}) => {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }
  return res.status === 204 ? null : res.json();
};

export const getEmployees   = () => fetcher("/employees/");
export const getAttendance  = () => fetcher("/attendance/");
export const getSummary     = (id) => fetcher(`/employees/${id}/attendance-summary/`);
export const createEmployee = (data) => fetcher("/employees/", { method: "POST", body: JSON.stringify(data) });
export const updateEmployee = (id, data) => fetcher(`/employees/${id}/`, { method: "PUT", body: JSON.stringify(data) });
export const deleteEmployee = (id) => fetcher(`/employees/${id}/`, { method: "DELETE" });
export const createAttendance = (data) => fetcher("/attendance/", { method: "POST", body: JSON.stringify(data) });
export const updateAttendance = (id, data) => fetcher(`/attendance/${id}/`, { method: "PUT", body: JSON.stringify(data) });
export const deleteAttendance = (id) => fetcher(`/attendance/${id}/`, { method: "DELETE" });