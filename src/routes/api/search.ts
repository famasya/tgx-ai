import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

export const Route = createFileRoute("/api/search")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const query = new URL(request.url).searchParams.get("query");
				if (!query) {
					return new Response("Missing query parameter", { status: 400 });
				}

				const result = await env.ai.autorag("tgxai-rag").search({ query });
				return json(result);
			},
		},
	},
});
