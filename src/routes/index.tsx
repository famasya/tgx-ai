import Chat from "@/components/chat";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div className="flex flex-col gap-2 h-screen w-full items-center justify-center">
			<Chat />
		</div>
	);
}
