import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import {
	Message,
	MessageAction,
	MessageActions,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import type { MyUIMessage } from "@/routes/api/chat";
import type { ChatRequestOptions, ChatStatus } from "ai";
import {
	CopyIcon,
	FileSearchIcon,
	NetworkIcon,
	RefreshCcwIcon,
	SearchIcon,
} from "lucide-react";

interface ChatMessagesProps {
	messages: MyUIMessage[];
	status: ChatStatus;
	regenerate: (options?: ChatRequestOptions) => void;
}

function ToolCallDisplay({
	toolName,
	input,
	output,
}: {
	toolName: string;
	input: Record<string, unknown>;
	output?: Record<string, unknown>;
}) {
	const getToolIcon = () => {
		switch (toolName) {
			case "documentSearch":
				return <SearchIcon className="size-4" />;
			case "documentContentSearchTool":
				return <FileSearchIcon className="size-4" />;
			case "documentRelationGraph":
				return <NetworkIcon className="size-4" />;
			default:
				return <SearchIcon className="size-4" />;
		}
	};

	const getToolLabel = () => {
		switch (toolName) {
			case "documentSearch":
				return "Mencari dokumen";
			case "documentContentSearchTool":
				return "Membaca isi dokumen";
			case "documentRelationGraph":
				return "Menganalisa relasi dokumen";
			case "sequentialThinking":
				return "Berpikir sekuensial";
			case "generateSummarySequentialThinking":
				return "Merangkum pemikiran";
			default:
				return toolName;
		}
	};

	const getToolArgs = (): string => {
		if (toolName === "documentSearch" && input?.query) {
			return String(input.query);
		}
		if (toolName === "documentContentSearchTool") {
			return `${String(input?.filename || "")} - ${String(input?.query || "")}`;
		}
		if (toolName === "documentRelationGraph" && input?.filename) {
			return String(input.filename);
		}
		return JSON.stringify(input);
	};

	const renderDocumentTitle = (doc: unknown): string => {
		const docRecord = doc as Record<string, unknown>;
		return String(docRecord.title || docRecord.filename || "Unknown");
	};

	const renderDocuments = () => {
		const documents = output?.documents;
		if (!documents || !Array.isArray(documents) || documents.length === 0) {
			return null;
		}

		return (
			<div className="mt-2 space-y-1">
				<div className="text-xs font-medium text-zinc-700">
					Ditemukan {String(documents.length)} dokumen:
				</div>
				{documents.slice(0, 3).map((doc, idx: number) => (
					<div
						key={`doc-${String(idx)}`}
						className="text-xs text-zinc-600 pl-2 border-l-2 border-zinc-300"
					>
						{renderDocumentTitle(doc)}
					</div>
				))}
				{documents.length > 3 && (
					<div className="text-xs text-zinc-500 pl-2">
						+{String(documents.length - 3)} lainnya
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="my-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
			<div className="flex items-start gap-2">
				<div className="mt-0.5 text-zinc-600">{getToolIcon()}</div>
				<div className="flex-1 min-w-0">
					<div className="font-medium text-sm text-zinc-900">
						{getToolLabel()}
					</div>
					<div className="text-xs text-zinc-600 mt-1 break-words">
						{getToolArgs()}
					</div>
					{renderDocuments()}
				</div>
			</div>
		</div>
	);
}

export function ChatMessages({
	messages,
	status,
	regenerate,
}: ChatMessagesProps) {
	return (
		<Conversation className="h-full">
			<ConversationContent>
				{messages.map((message) => (
					<div key={message.id}>
						{message.parts.map((part, i) => {
							switch (part.type) {
								case "text":
									return (
										<Message key={`${message.id}-${i}`} from={message.role}>
											<MessageContent>
												<MessageResponse>{part.text}</MessageResponse>
											</MessageContent>
											{message.role === "assistant" && (
												<MessageActions>
													<MessageAction
														onClick={() => regenerate()}
														label="Retry"
													>
														<RefreshCcwIcon className="size-3" />
													</MessageAction>
													<MessageAction
														onClick={() =>
															navigator.clipboard.writeText(part.text)
														}
														label="Copy"
													>
														<CopyIcon className="size-3" />
													</MessageAction>
												</MessageActions>
											)}
										</Message>
									);
								case "reasoning":
									return (
										<Reasoning
											key={`${message.id}-${i}`}
											className="w-full bg-gradient-to-b from-blue-50 to-blue-100 p-2 rounded-lg border border-blue-200"
											defaultOpen={false}
											isStreaming={
												status === "streaming" &&
												i === message.parts.length - 1 &&
												message.id === messages.at(-1)?.id
											}
										>
											<ReasoningTrigger />
											<ReasoningContent className="text-black data-[state=closed]:animate-none data-[state=open]:animate-none">
												{part.text}
											</ReasoningContent>
										</Reasoning>
									);
								case "tool-documentSearch":
									return (
										<div key={`${message.id}-${i}`} className="px-4 sm:px-6">
											<ToolCallDisplay
												toolName="documentSearch"
												input={(part.input || {}) as Record<string, unknown>}
												output={part.output as Record<string, unknown>}
											/>
										</div>
									);
								case "tool-documentContentSearchTool":
									return (
										<div key={`${message.id}-${i}`} className="px-4 sm:px-6">
											<ToolCallDisplay
												toolName="documentContentSearchTool"
												input={(part.input || {}) as Record<string, unknown>}
												output={part.output as Record<string, unknown>}
											/>
										</div>
									);
								case "tool-documentRelationGraph":
									return (
										<div key={`${message.id}-${i}`} className="px-4 sm:px-6">
											<ToolCallDisplay
												toolName="documentRelationGraph"
												input={(part.input || {}) as Record<string, unknown>}
												output={part.output as Record<string, unknown>}
											/>
										</div>
									);
								case "tool-sequentialThinking":
									return (
										<div key={`${message.id}-${i}`} className="px-4 sm:px-6">
											<ToolCallDisplay
												toolName="sequentialThinking"
												input={(part.input || {}) as Record<string, unknown>}
												output={part.output as Record<string, unknown>}
											/>
										</div>
									);
								case "tool-generateSummarySequentialThinking":
									return (
										<div key={`${message.id}-${i}`} className="px-4 sm:px-6">
											<ToolCallDisplay
												toolName="generateSummarySequentialThinking"
												input={(part.input || {}) as Record<string, unknown>}
												output={part.output as Record<string, unknown>}
											/>
										</div>
									);
								default:
									return null;
							}
						})}
					</div>
				))}
				{status === "submitted" && <Loader />}
			</ConversationContent>
			<ConversationScrollButton />
		</Conversation>
	);
}
