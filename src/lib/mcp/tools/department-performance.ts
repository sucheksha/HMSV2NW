import { defineTool } from "@lovable.dev/mcp-js";
import { departmentPerformance } from "@/lib/mock-data";

export default defineTool({
  name: "department_performance",
  title: "Department performance",
  description: "Return per-department patient volume and revenue (in ₹ thousands) for the current period.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(departmentPerformance, null, 2) }],
    structuredContent: { departments: departmentPerformance },
  }),
});
