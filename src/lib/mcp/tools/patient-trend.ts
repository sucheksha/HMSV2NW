import { defineTool } from "@lovable.dev/mcp-js";
import { patientTrend, revenueTrend } from "@/lib/mock-data";

export default defineTool({
  name: "get_trends",
  title: "Get patient & revenue trends",
  description:
    "Return the weekly OPD/IPD patient trend and monthly revenue vs. expense trend (revenue/expense in ₹ lakhs).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify({ patientTrend, revenueTrend }, null, 2),
      },
    ],
    structuredContent: { patientTrend, revenueTrend },
  }),
});
