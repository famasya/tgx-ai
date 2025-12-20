import { tool } from "ai";
import { env } from "cloudflare:workers";
import { z } from "zod";
import { BUCKET_DOMAIN } from "../constants";

const documentSearchSchema = z.object({
	query: z.string().describe("The search query to find relevant documents"),
});
export const documentSearchTool = tool({
	description: "Search for relevant documents based on keywords or phrases",
	inputSchema: documentSearchSchema,
	execute: async ({ query }: { query: string }) => {
		const response = await env.ai.autorag("tgxai-rag").search({
			query,
		});

		const { data, ...rest } = response;

		return {
			...rest,
			data: data.map((item) => ({
				...item,
				link: `${BUCKET_DOMAIN}/${item.filename}`,
			})),
		};
	},
});
