import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { appointmentQueue } from "@/lib/mock-data";

export default defineTool({
  name: "list_appointments",
  title: "List appointment queue",
  description:
    "List today's appointment queue. Optionally filter by department, doctor, or status (case-insensitive substring match).",
  inputSchema: {
    department: z.string().optional().describe("Department name filter, e.g. 'Cardiology'."),
    doctor: z.string().optional().describe("Doctor name filter, e.g. 'Dr. Shah'."),
    status: z.string().optional().describe("Status filter, e.g. 'Waiting', 'Ready', 'In consultation'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ department, doctor, status }) => {
    const like = (a: string, b?: string) => !b || a.toLowerCase().includes(b.toLowerCase());
    const rows = appointmentQueue.filter(
      (a) => like(a.dept, department) && like(a.doctor, doctor) && like(a.status, status),
    );
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { count: rows.length, appointments: rows },
    };
  },
});
