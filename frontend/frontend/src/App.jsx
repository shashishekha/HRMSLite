import { useState, useEffect } from "react";
import {
  getEmployees, getAttendance, getSummary,
  createEmployee, updateEmployee, deleteEmployee,
  createAttendance, updateAttendance, deleteAttendance,
} from "./api";

export default function App() {
  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [summary, setSummary] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [emps, att] = await Promise.all([getEmployees(), getAttendance()]);
      setEmployees(emps);
      setAttendance(att);
    } catch {
      showToast("Failed to load data", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleDeleteEmployee = async (id) => {
    if (!confirm("Delete this employee?")) return;
    try { await deleteEmployee(id); showToast("Employee deleted"); loadAll(); }
    catch { showToast("Delete failed", true); }
  };

  const handleDeleteAttendance = async (id) => {
    if (!confirm("Delete this record?")) return;
    try { await deleteAttendance(id); showToast("Record deleted"); loadAll(); }
    catch { showToast("Delete failed", true); }
  };

  const handleSummary = async (emp) => {
    try { setSummary({ emp, data: await getSummary(emp.id) }); }
    catch { showToast("Could not load summary", true); }
  };

  const todayAtt = attendance.filter(a => a.date === today);

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto", padding: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>HR Attendance</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setTab("employees")} style={tab === "employees" ? activeTab : inactiveTab}>Employees</button>
          <button onClick={() => setTab("attendance")} style={tab === "attendance" ? activeTab : inactiveTab}>Attendance</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total", value: employees.length, color: "#2563eb" },
          { label: "Present", value: todayAtt.filter(a => a.status === "present").length, color: "#16a34a" },
          { label: "Absent", value: todayAtt.filter(a => a.status === "absent").length, color: "#dc2626" },
          { label: "Late", value: todayAtt.filter(a => a.status === "late").length, color: "#d97706" },
        ].map(s => (
          <div key={s.label} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{s.label} Today</div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          onClick={() => setModal({ type: tab === "employees" ? "addEmployee" : "addAttendance" })}
          style={primaryBtn}>
          + {tab === "employees" ? "Add Employee" : "Mark Attendance"}
        </button>
      </div>

      {loading && <p style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>Loading…</p>}

      {/* Employees Table */}
      {!loading && tab === "employees" && (
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["ID", "Name", "Email", "Department", "Actions"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0
              ? <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No employees yet</td></tr>
              : employees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={tdStyle}><span style={badgeStyle}>{emp.employee_id}</span></td>
                  <td style={tdStyle}>{emp.name}</td>
                  <td style={{ ...tdStyle, color: "#6b7280", fontSize: 13 }}>{emp.email}</td>
                  <td style={tdStyle}>{emp.dept}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleSummary(emp)} style={ghostBtn}>Stats</button>
                      <button onClick={() => setModal({ type: "editEmployee", data: emp })} style={ghostBtn}>Edit</button>
                      <button onClick={() => handleDeleteEmployee(emp.id)} style={dangerBtn}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {/* Attendance Table */}
      {!loading && tab === "attendance" && (
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Employee", "Date", "Status", "Actions"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0
              ? <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No records yet</td></tr>
              : attendance.map(rec => {
                const emp = employees.find(e => e.id === rec.employee);
                const statusColor = { present: "#16a34a", absent: "#dc2626", late: "#d97706" }[rec.status] || "#6b7280";
                return (
                  <tr key={rec.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={tdStyle}>
                      <div>{emp?.name ?? "—"}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{emp?.employee_id}</div>
                    </td>
                    <td style={{ ...tdStyle, color: "#6b7280", fontSize: 13 }}>{rec.date}</td>
                    <td style={tdStyle}>
                      <span style={{ color: statusColor, fontWeight: 600, fontSize: 13 }}>
                        ● {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setModal({ type: "editAttendance", data: rec })} style={ghostBtn}>Edit</button>
                        <button onClick={() => handleDeleteAttendance(rec.id)} style={dangerBtn}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}

      {/* Modals */}
      {modal?.type === "addEmployee" && (
        <Modal title="Add Employee" onClose={() => setModal(null)}>
          <EmpForm onClose={() => setModal(null)} onSave={() => { setModal(null); loadAll(); showToast("Employee added!"); }} />
        </Modal>
      )}
      {modal?.type === "editEmployee" && (
        <Modal title="Edit Employee" onClose={() => setModal(null)}>
          <EmpForm initial={modal.data} onClose={() => setModal(null)} onSave={() => { setModal(null); loadAll(); showToast("Employee updated!"); }} />
        </Modal>
      )}
      {modal?.type === "addAttendance" && (
        <Modal title="Mark Attendance" onClose={() => setModal(null)}>
          <AttForm employees={employees} onClose={() => setModal(null)} onSave={() => { setModal(null); loadAll(); showToast("Attendance marked!"); }} />
        </Modal>
      )}
      {modal?.type === "editAttendance" && (
        <Modal title="Edit Record" onClose={() => setModal(null)}>
          <AttForm employees={employees} initial={modal.data} onClose={() => setModal(null)} onSave={() => { setModal(null); loadAll(); showToast("Record updated!"); }} />
        </Modal>
      )}

      {/* Summary Modal */}
      {summary && (
        <Modal title={`${summary.emp.name} — Summary`} onClose={() => setSummary(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Total", value: summary.data.total_records },
              { label: "Present", value: summary.data.present },
              { label: "Absent", value: summary.data.absent },
              { label: "Late", value: summary.data.late },
            ].map(s => (
              <div key={s.label} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setSummary(null)} style={{ ...primaryBtn, width: "100%" }}>Close</button>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24,
          background: toast.isError ? "#fee2e2" : "#dcfce7",
          color: toast.isError ? "#991b1b" : "#166534",
          padding: "12px 20px", borderRadius: 8, fontSize: 14,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#fff", borderRadius: 10, width: 420, maxWidth: "90vw", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af" }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Employee Form ─────────────────────────────────────────────────────────────
function EmpForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { employee_id: "", name: "", email: "", dept: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setSaving(true); setErrors({});
    try {
      initial ? await updateEmployee(initial.id, form) : await createEmployee(form);
      onSave();
    } catch (err) { setErrors(err); }
    finally { setSaving(false); }
  };

  return (
    <>
      {[["Employee ID", "employee_id", "EMP-001"], ["Full Name", "name", "Jane Smith"], ["Email", "email", "jane@co.com"], ["Department", "dept", "Engineering"]].map(([label, key, ph]) => (
        <div key={key} style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{label}</label>
          <input value={form[key]} onChange={set(key)} placeholder={ph} style={inputStyle} />
          {errors[key] && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 3 }}>{errors[key][0]}</p>}
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onClose} style={ghostBtn}>Cancel</button>
        <button onClick={submit} disabled={saving} style={primaryBtn}>{saving ? "Saving…" : initial ? "Update" : "Add"}</button>
      </div>
    </>
  );
}

// ── Attendance Form ───────────────────────────────────────────────────────────
function AttForm({ employees, initial, onSave, onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState(initial || { employee: "", date: today, status: "present" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setSaving(true); setErrors({});
    try {
      initial ? await updateAttendance(initial.id, form) : await createAttendance(form);
      onSave();
    } catch (err) { setErrors(err); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Employee</label>
        <select value={form.employee} onChange={set("employee")} style={inputStyle}>
          <option value="">— Select —</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.employee_id})</option>)}
        </select>
        {errors.employee && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 3 }}>{errors.employee[0]}</p>}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Date</label>
        <input type="date" value={form.date} onChange={set("date")} max={today} style={inputStyle} />
        {errors.date && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 3 }}>{errors.date[0]}</p>}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Status</label>
        <select value={form.status} onChange={set("status")} style={inputStyle}>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onClose} style={ghostBtn}>Cancel</button>
        <button onClick={submit} disabled={saving} style={primaryBtn}>{saving ? "Saving…" : initial ? "Update" : "Mark"}</button>
      </div>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const primaryBtn  = { background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const ghostBtn    = { background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13 };
const dangerBtn   = { background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13 };
const activeTab   = { ...primaryBtn };
const inactiveTab = { ...ghostBtn, padding: "8px 16px" };
const tableStyle  = { width: "100%", borderCollapse: "collapse", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", fontSize: 14 };
const thStyle     = { padding: "10px 16px", textAlign: "left", fontSize: 12, color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #e5e7eb" };
const tdStyle     = { padding: "12px 16px", verticalAlign: "middle" };
const badgeStyle  = { background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600 };
const labelStyle  = { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 5, color: "#374151" };
const inputStyle  = { width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" };