import { Button } from "@/components/ui/button";
import { BUCKET_DOMAIN } from "@/lib/constants";
import { Document } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import z from "zod";

const getDocumentsList = createServerFn()
	.inputValidator(
		z.object({
			cursor: z.string().optional(),
		}),
	)
	.handler(async ({ data: { cursor } }) => {
		const results = (await env.r2.list({ cursor, limit: 10 })) as R2Objects & {
			cursor: string;
		};
		const docs = results.objects.map((item) => ({
			key: item.key,
			size: item.size,
			uploaded: item.uploaded,
		}));
		const nextCursor = results.cursor as string;
		return {
			documents: docs,
			cursor: nextCursor,
		};
	});
export const Route = createFileRoute("/docs")({
	component: RouteComponent,
});

const formatSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

function RouteComponent() {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useInfiniteQuery({
			queryKey: ["docs"],
			queryFn: ({ pageParam }) =>
				getDocumentsList({ data: { cursor: pageParam } }),
			initialPageParam: undefined as string | undefined,
			getNextPageParam: (lastPage) => lastPage.cursor,
		});

	const allDocuments = data?.pages.flatMap((page) => page.documents) ?? [];

	return (
		<main className="flex flex-col h-full max-w-4xl w-full mx-auto">
			<div className="flex-1 p-4">
				<h1 className="text-2xl font-bold">Dokumen Sumber</h1>
				<p className="text-sm text-gray-600 mt-1">
					Daftar dokumen yang diunggah ke sistem untuk diproses dan dijadikan
					konteks. Dokumen akan ditambah secara periodik ke dalam database.
				</p>

				<div className="mt-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
					{isLoading ? (
						<div className="text-center py-4">Loading...</div>
					) : (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{allDocuments.map((doc) => (
									<div
										key={doc.key}
										className="border flex flex-row items-start gap-2 rounded-lg p-2 hover:bg-gray-50 transition-colors"
									>
										<div className="mt-1">
											<HugeiconsIcon icon={Document} className="w-8" />
										</div>
										<div className="flex flex-col flex-1 min-w-0">
											<a
												href={`${BUCKET_DOMAIN}/${encodeURIComponent(doc.key)}`}
												target="_blank"
												rel="noopener noreferrer"
												className="font-medium text-sm text-blue-600 hover:text-blue-800 hover:underline break-words"
												title={doc.key}
											>
												{doc.key}
											</a>
											<div className="text-sm text-gray-500 mt-1">
												Size: {formatSize(doc.size)}
											</div>
											<div className="text-sm text-gray-500">
												Uploaded: {doc.uploaded.toLocaleString()}
											</div>
										</div>
									</div>
								))}
							</div>
							{hasNextPage && (
								<div className="mt-4 flex justify-center">
									<Button
										variant="outline"
										onClick={() => fetchNextPage()}
										disabled={isFetchingNextPage}
									>
										{isFetchingNextPage ? "Loading more..." : "Load More"}
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</main>
	);
}
