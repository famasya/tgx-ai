import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { BUCKET_DOMAIN } from "@/lib/constants";
import { Document } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Streamdown } from "@phaserjs/streamdown-lite";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface DocumentSearchResultsProps {
	output: AutoRagSearchResponse;
	query: string;
}

export function DocumentSearchResults({
	output,
	query,
}: DocumentSearchResultsProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const documents = output?.data || [];

	if (!documents || documents.length === 0) {
		return null;
	}

	return (
		<>
			<Button
				variant={"outline"}
				size={"sm"}
				onClick={() => setIsDialogOpen(true)}
			>
				<HugeiconsIcon icon={Document} /> Ditemukan {documents.length} dokumen
			</Button>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] flex flex-col p-4 sm:p-6">
					<DialogHeader className="flex-shrink-0">
						<DialogTitle className="text-lg sm:text-xl">Hasil Pencarian Dokumen</DialogTitle>
						<DialogDescription className="line-clamp-2 text-sm">
							Hasil pencarian untuk: {query}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3 sm:space-y-4 flex-1 overflow-hidden flex flex-col">
						<div className="text-sm text-zinc-700 flex-shrink-0">
							Ditemukan{" "}
							<span className="font-semibold">{documents.length}</span> dokumen
						</div>
						<div className="space-y-2 sm:space-y-3 overflow-y-auto flex-1 pr-1">
							{documents.map((doc, idx) => {
								const title = doc.filename || "Unknown";
								const link = `${BUCKET_DOMAIN}/${doc.filename}` || "";
								const score = doc.score ? doc.score.toFixed(3) : null;

								return (
									<div
										key={`dialog-doc-${doc.file_id}-${idx}`}
										className="p-3 sm:p-4 border border-zinc-200 rounded-lg transition-colors"
									>
										<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
											<div className="flex-1 min-w-0">
												<div className="font-medium text-sm text-zinc-900 break-words">
													{title}
												</div>
												{link && (
													<a
														href={link}
														target="_blank"
														rel="noopener noreferrer"
														className="text-xs text-blue-600 hover:text-blue-700 hover:underline break-all block mt-1"
													>
														{link}
													</a>
												)}
											</div>
											{score && (
												<Badge variant={"default"} className="self-start flex-shrink-0">Score: {score}</Badge>
											)}
										</div>
										<div className="mt-2 text-sm text-zinc-700 bg-zinc-100 p-2 sm:p-3 rounded overflow-auto">
											<Streamdown>{doc.content?.[0].text}</Streamdown>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
