import {
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@/components/ai-elements/sources";
import { DocumentRelationGraphRenderer } from "@/components/document-relation-graph-renderer";
import { BUCKET_DOMAIN } from "@/lib/constants";
import type { MyUIMessage } from "@/routes/api/chat";
import { Streamdown } from "@phaserjs/streamdown-lite";
import { ExternalLink } from "lucide-react";
interface DocumentSourcesProps {
	messages: MyUIMessage[];
}

export function DocumentSources({ messages }: DocumentSourcesProps) {
	// Extract all document search results from messages
	const documentSearchResults = messages
		.filter((message) => message.role === "assistant")
		.flatMap((message) =>
			message.parts
				.filter(
					(part) =>
						part.type === "tool-documentSearch" &&
						part.state === "output-available",
				)
				.map((part) => ({
					messageId: message.id,
					part,
				})),
		);

	// Extract all document relation graph results from messages
	const documentGraphResults = messages
		.filter((message) => message.role === "assistant")
		.flatMap((message) =>
			message.parts
				.filter(
					(part) =>
						part.type === "tool-documentRelationGraph" &&
						part.state === "output-available",
				)
				.map((part) => ({
					messageId: message.id,
					part,
				})),
		);

	if (documentSearchResults.length === 0 && documentGraphResults.length === 0) {
		return (
			<div className="h-full flex items-center justify-center text-zinc-400">
				<p className="text-sm">No document sources available</p>
			</div>
		);
	}

	return (
		<div className="h-full overflow-auto p-6 space-y-6">
			{documentSearchResults.map(({ messageId, part }, index) => (
				<div key={`${messageId}-${index.toString()}`}>
					<Sources>
						<SourcesTrigger count={part.output?.data?.length || 0} />
						{part.output?.data?.map((result) => (
							<SourcesContent key={result.file_id}>
								<div className="p-4 bg-blue-100 border border-blue-200 rounded-lg space-y-3">
									<div className="text-sm">
										<strong className="font-medium">Query:</strong>
										<span className="ml-2 text-zinc-700">
											{part.input.query}
										</span>
									</div>

									<div className="border-t border-blue-200 pt-3">
										<div className="flex flex-row items-center font-medium text-sm mb-3">
											<ExternalLink className="mr-1 w-4 h-4 shrink-0" />
											<a
												className="text-blue-500 hover:text-blue-700"
												href={`${BUCKET_DOMAIN}/${result.filename}`}
												target="_blank"
											>
												{result.filename}
											</a>
										</div>
										<div className="space-y-3">
											{result.content?.map((content, index) => (
												<div
													key={index.toString()}
													className="text-sm bg-white p-3 rounded prose prose-sm max-w-none"
												>
													<Streamdown>{content.text}</Streamdown>
												</div>
											))}
										</div>
									</div>
								</div>
							</SourcesContent>
						))}
					</Sources>
				</div>
			))}
			{documentGraphResults.map(({ messageId, part }, index) => (
				<div key={`graph-${messageId}-${index.toString()}`}>
					<DocumentRelationGraphRenderer part={part} />
				</div>
			))}
		</div>
	);
}
