import { defineMcp } from "@lovable.dev/mcp-js";
import listKpis from "./tools/list-kpis";
import listAppointments from "./tools/list-appointments";
import departmentPerformance from "./tools/department-performance";
import trends from "./tools/patient-trend";
import notifications from "./tools/notifications";
import clinicalQueues from "./tools/clinical-queues";

export default defineMcp({
  name: "jeevix-hms-mcp",
  title: "JEEVIX Hospital Operating System",
  version: "0.1.0",
  instructions:
    "Read-only tools for the JEEVIX Hospital Management System demo. Query operational KPIs, appointment queues, department performance, patient & revenue trends, notifications, and the doctor/nurse clinical queues. All data is in-memory demo data.",
  tools: [
    listKpis,
    listAppointments,
    departmentPerformance,
    trends,
    notifications,
    clinicalQueues,
  ],
});
