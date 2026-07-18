import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notifications } from "@/lib/mock-data";

export default defineTool({
  name: "list_notifications",
  title: "List notifications",
  description: "List recent hospital notifications. Optionally filter by type: critical, warning, info.",
  inputSchema: {
    type: z.enum(["critical", "warning", "info"]).optional().describe("Notification severity filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ type }) => {
    const rows = type ? notifications.filter((n) => n.type === type) : notifications;
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { count: rows.length, notifications: rows },
    };
  },
});
