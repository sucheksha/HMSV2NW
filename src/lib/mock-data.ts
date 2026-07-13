// Mock data for JEEVIX HMS dashboards. Replace with real API responses later.

export const adminKpis = [
  { label: "Today's Patients", value: 342, delta: "+12%", tone: "positive" as const },
  { label: "Appointments", value: 128, delta: "+4%", tone: "positive" as const },
  { label: "Admissions", value: 24, delta: "+2", tone: "neutral" as const },
  { label: "Discharges", value: 18, delta: "-3", tone: "neutral" as const },
  { label: "Today's Revenue", value: "₹8.42L", delta: "+9.1%", tone: "positive" as const },
  { label: "Pending Bills", value: "₹1.16L", delta: "42 invoices", tone: "warning" as const },
  { label: "Bed Occupancy", value: "78%", delta: "312 / 400", tone: "neutral" as const },
  { label: "Staff On Duty", value: 214, delta: "96% attendance", tone: "positive" as const },
];

export const patientTrend = [
  { day: "Mon", opd: 240, ipd: 40 },
  { day: "Tue", opd: 268, ipd: 46 },
  { day: "Wed", opd: 302, ipd: 52 },
  { day: "Thu", opd: 289, ipd: 48 },
  { day: "Fri", opd: 330, ipd: 55 },
  { day: "Sat", opd: 378, ipd: 61 },
  { day: "Sun", opd: 205, ipd: 38 },
];

export const revenueTrend = [
  { month: "Feb", revenue: 68, expense: 42 },
  { month: "Mar", revenue: 74, expense: 44 },
  { month: "Apr", revenue: 71, expense: 46 },
  { month: "May", revenue: 82, expense: 49 },
  { month: "Jun", revenue: 89, expense: 51 },
  { month: "Jul", revenue: 95, expense: 54 },
];

export const departmentPerformance = [
  { dept: "Cardiology", patients: 82, revenue: 210 },
  { dept: "Orthopedics", patients: 64, revenue: 168 },
  { dept: "Pediatrics", patients: 71, revenue: 96 },
  { dept: "Neurology", patients: 48, revenue: 152 },
  { dept: "General Med", patients: 92, revenue: 118 },
  { dept: "ENT", patients: 39, revenue: 62 },
];

export const appointmentQueue = [
  { token: "A-014", patient: "Rohan Verma", doctor: "Dr. Shah", dept: "Cardiology", time: "09:20", status: "Waiting" },
  { token: "A-015", patient: "Meera Iyer", doctor: "Dr. Nair", dept: "OB-GYN", time: "09:25", status: "In consultation" },
  { token: "A-016", patient: "Kabir Singh", doctor: "Dr. Kapoor", dept: "Orthopedics", time: "09:30", status: "Ready" },
  { token: "A-017", patient: "Aditi Bose", doctor: "Dr. Shah", dept: "Cardiology", time: "09:35", status: "Waiting" },
  { token: "A-018", patient: "Farhan Ali", doctor: "Dr. Rao", dept: "Neurology", time: "09:40", status: "Vitals" },
  { token: "A-019", patient: "Sneha Patil", doctor: "Dr. Shah", dept: "Cardiology", time: "09:45", status: "Waiting" },
];

export const notifications = [
  { id: 1, type: "critical", title: "ICU-3 monitor alert", time: "2m ago" },
  { id: 2, type: "warning", title: "Amoxicillin 500mg — low stock", time: "18m ago" },
  { id: 3, type: "info", title: "Lab report ready for UHID 20418", time: "34m ago" },
  { id: 4, type: "info", title: "Dr. Shah shift starts at 10:00", time: "1h ago" },
];

export const doctorQueue = [
  { token: "A-014", patient: "Rohan Verma", age: 42, complaint: "Chest tightness, 3 days", status: "Ready", waited: "8m" },
  { token: "A-017", patient: "Aditi Bose", age: 55, complaint: "Follow-up — hypertension", status: "Vitals done", waited: "12m" },
  { token: "A-019", patient: "Sneha Patil", age: 29, complaint: "Palpitations", status: "Waiting", waited: "3m" },
  { token: "A-022", patient: "Mahesh Kulkarni", age: 61, complaint: "Post-op review", status: "Waiting", waited: "1m" },
];

export const nurseQueue = [
  { token: "A-016", patient: "Kabir Singh", age: 34, doctor: "Dr. Kapoor", stage: "Vitals pending" },
  { token: "A-018", patient: "Farhan Ali", age: 47, doctor: "Dr. Rao", stage: "Vitals" },
  { token: "A-020", patient: "Isha Reddy", age: 22, doctor: "Dr. Shah", stage: "History" },
  { token: "A-021", patient: "Devansh Jain", age: 8, doctor: "Dr. Nair", stage: "Verification" },
];
