import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea
} from "@/components/ai-elements/prompt-input";
import { ChatMessages } from "@/components/chat-messages";
import { DocumentSources } from "@/components/document-sources";
import { saveSession } from "@/lib/session";
import type { MyUIMessage } from "@/routes/api/chat";
import { useChat } from "@ai-sdk/react";
import { Save } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import { Suggestion, Suggestions } from "./ai-elements/suggestion";
import { Button } from "./ui/button";

type Props = {
	initialMessages?: MyUIMessage[];
	sessionId?: string;
}
export default function Chat({ initialMessages, sessionId }: Props) {
	const [input, setInput] = useState("");
	const { messages, sendMessage, status, regenerate, stop } =
		useChat<MyUIMessage>({ messages: initialMessages ?? [] });

	const [isPending, startTransition] = useTransition();

	const handleSubmit = (
		message: PromptInputMessage,
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		if (status === "streaming" || status === "submitted") {
			return stop();
		}

		if (!message.text) {
			return;
		}

		sendMessage({ text: message.text });
		setInput("");
	};
	const [suggestionsCache, _setSuggestionsCache] = useState<string[]>([
		"Carikan perda apa saja tentang lingkungan hidup",
		"Ada berapa hibah kendaraan bermotor?",
		"Carikan perda tentang pengadaan barang/jasa",
	]);

	return (
		<div className="w-full h-screen flex">
			{/* Left side - Chat */}
			<div className="w-1/2 flex flex-col border-r">
				<div className="flex-1 overflow-hidden">
					<ChatMessages
						messages={messages}
						status={status}
						regenerate={regenerate}
					/>
				</div>
				<div className="border-t p-4 flex-shrink-0">
					<Suggestions className="mb-2">
						{suggestionsCache.map((suggestion, index) => (
							<Suggestion
								onClick={() => setInput(suggestion)}
								key={index.toString()}
								suggestion={suggestion}
							/>
						))}
					</Suggestions>
					<PromptInput onSubmit={handleSubmit}>
						<PromptInputBody>
							<PromptInputTextarea
								onChange={(e) => setInput(e.target.value)}
								value={input}
							/>
						</PromptInputBody>
						<PromptInputFooter>
							<PromptInputSubmit disabled={!input && !status} status={status} />
							<Button size="sm" disabled={messages.length === 0 || isPending} onClick={async () => {
								await saveSession({ data: { messages, id: sessionId } });
							}}><Save /> Simpan</Button>
						</PromptInputFooter>
					</PromptInput>
				</div>
			</div>

			{/* Right side - Document Sources */}
			<div className="w-1/2 flex flex-col">
				<DocumentSources messages={messages} />
			</div>
		</div>
	);
}
