import Chat from "@/components/chat";
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import z from "zod";

export const Route = createFileRoute("/")({
	validateSearch: z.object({
		session: z.string().optional(),
	}),
	loaderDeps: ({ search }) => ({ session: search.session }),
	loader: async ({ deps: { session } }) => {
		if (session) {
			const data = await env.kv.get(`session:${session}`);
			if (data) {
				return JSON.parse(data);
			}
			return [];
		}

		return [];
	},
	component: Home,
});

function Home() {
	const { session } = Route.useSearch();
	const initialMessages = Route.useLoaderData();
	return (
		<div className="flex flex-col gap-2 h-screen w-full items-center justify-center">
			<Chat initialMessages={initialMessages} sessionId={session} />
		</div>
	);
}
