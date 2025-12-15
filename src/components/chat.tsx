import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { ChatMessages } from "@/components/chat-messages";
import { DocumentSources } from "@/components/document-sources";
import type { MyUIMessage } from "@/routes/api/chat";
import { useChat } from "@ai-sdk/react";
import { TextSearch, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Suggestion, Suggestions } from "./ai-elements/suggestion";
import { Button } from "./ui/button";

export default function Chat() {
	const [input, setInput] = useState("");
	const [showSources, setShowSources] = useState(true);
	const { messages, sendMessage, status, regenerate, stop } =
		useChat<MyUIMessage>();

	// Show sources by default on desktop
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setShowSources(false);
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

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
		<div className="w-full h-full flex flex-col md:flex-row relative">
			{/* Main Chat Area */}
			<div
				className={`flex flex-col h-full transition-all duration-300 ${showSources ? "w-full md:w-1/2" : "w-full"}`}
			>
				<div className="flex-1 overflow-hidden">
					<ChatMessages
						messages={messages}
						status={status}
						regenerate={regenerate}
					/>
				</div>
				<div className="border-t p-2 sm:p-4 flex-shrink-0">
					<div className="flex items-center justify-between mb-2 gap-4">
						<Suggestions className="flex-1">
							{suggestionsCache.map((suggestion, index) => (
								<Suggestion
									onClick={() => setInput(suggestion)}
									key={index.toString()}
									suggestion={suggestion}
								/>
							))}
						</Suggestions>
						<Button
							size={"sm"}
							onClick={() => setShowSources(!showSources)}
							title={showSources ? "Hide Sources" : "Show Sources"}
						>
							<TextSearch className="w-4 h-4" />
						</Button>
					</div>
					<PromptInput onSubmit={handleSubmit}>
						<PromptInputBody>
							<PromptInputTextarea
								onChange={(e) => setInput(e.target.value)}
								value={input}
							/>
						</PromptInputBody>
						<PromptInputFooter>
							<PromptInputSubmit disabled={!input && !status} status={status} />
						</PromptInputFooter>
					</PromptInput>
				</div>
			</div>

			{/* Document Sources Panel */}
			{showSources && (
				<div className="fixed md:relative inset-0 md:inset-auto w-full md:w-1/2 flex flex-col bg-white md:bg-transparent z-50 md:z-auto">
					<div className="flex items-center justify-between p-4 border-b md:hidden">
						<h2 className="font-semibold">Document Sources</h2>
						<button
							onClick={() => setShowSources(false)}
							className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
							type="button"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
					<div className="flex-1 overflow-hidden border-l">
						<DocumentSources messages={messages} />
					</div>
				</div>
			)}
		</div>
	);
}
