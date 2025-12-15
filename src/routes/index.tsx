import Chat from "@/components/chat";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import z from "zod";

export const loadSession = createServerFn()
	.inputValidator(
		z.object({
			session: z.string().optional(),
		}),
	)
	.handler(async ({ data: session }) => {
		if (session) {
			const data = await env.kv.get(`session:${session}`);
			if (data) {
				return JSON.parse(data);
			}
		}
		return [];
	});

export const Route = createFileRoute("/")({
	validateSearch: z.object({
		session: z.string().optional(),
	}),
	loaderDeps: ({ search }) => ({ session: search.session }),
	loader: async ({ deps: { session } }) => {
		return loadSession({ data: { session } });
	},
	component: Home,
});

function Home() {
	return <Chat />;
}
