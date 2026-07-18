import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { doctorQueue, nurseQueue } from "@/lib/mock-data";

export default defineTool({
  name: "list_clinical_queue",
  title: "List clinical queue",
  description:
    "List the current work queue for a clinical role. Use 'doctor' for consultation queue or 'nurse' for the preparation queue.",
  inputSchema: {
    role: z.enum(["doctor", "nurse"]).describe("Which queue to fetch."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ role }) => {
    const rows = role === "doctor" ? doctorQueue : nurseQueue;
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { role, count: rows.length, queue: rows },
    };
  },
});
