import { defineTool } from "@lovable.dev/mcp-js";
import { adminKpis } from "@/lib/mock-data";

export default defineTool({
  name: "list_hospital_kpis",
  title: "List hospital KPIs",
  description:
    "Return today's operational KPIs for the hospital (patients, appointments, admissions, revenue, occupancy, staff).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(adminKpis, null, 2) }],
    structuredContent: { kpis: adminKpis },
  }),
});
