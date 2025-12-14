import type { Tool } from "ai";
import { env } from "cloudflare:workers";
import { z } from "zod";

export const documentSearchTool: Tool = {
	description: "Search for documents based on keywords or phrases",
	inputSchema: z.object({
		query: z.string().describe("The search query to find relevant documents"),
	}),
	execute: async ({ query }: { query: string }) => {
		const response = (await env.ai.autorag("tgxai-rag").search({
			query,
		})) as AutoRagSearchResponse;
		return response;
	},
};
