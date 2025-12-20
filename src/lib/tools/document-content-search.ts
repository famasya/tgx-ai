import { tool } from "ai";
import { env } from "cloudflare:workers";
import z from "zod";

const documentContentSearchSchema = z.object({
	query: z
		.string()
		.describe("The search query to find content in a specific document"),
	filename: z.string().describe("The filename to search in"),
});
export const documentContentSearchTool = tool({
	description: "Search for content in a specific document based on user query",
	inputSchema: documentContentSearchSchema,
	execute: async ({ query, filename }) => {
		const response = await env.ai.autorag("tgxai-rag").search({
			query,
			filters: {
				type: "eq",
				key: "filename",
				value: filename,
			},
		});

		return response;
	},
});
