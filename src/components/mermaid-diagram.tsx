import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
	chart: string;
	className?: string;
}

let mermaidLoaded = false;
let mermaidLoadingPromise: Promise<void> | null = null;

function loadMermaid(): Promise<void> {
	if (mermaidLoaded) {
		return Promise.resolve();
	}

	if (mermaidLoadingPromise) {
		return mermaidLoadingPromise;
	}

	mermaidLoadingPromise = new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
		script.onload = () => {
			if (window.mermaid) {
				window.mermaid.initialize({
					startOnLoad: false,
					theme: "neutral",
					securityLevel: "loose",
				});
				mermaidLoaded = true;
				resolve();
			}
		};
		script.onerror = reject;
		document.head.appendChild(script);
	});

	return mermaidLoadingPromise;
}

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		async function renderDiagram() {
			try {
				setIsLoading(true);
				setError(null);

				await loadMermaid();

				if (!mounted || !containerRef.current) return;

				// Clear previous content
				containerRef.current.innerHTML = "";

				// Generate unique ID for this diagram
				const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

				// Render the diagram
				if (!window.mermaid) {
					throw new Error("Mermaid failed to load");
				}

				const { svg } = await window.mermaid.render(id, chart);

				if (mounted && containerRef.current) {
					containerRef.current.innerHTML = svg;
					setIsLoading(false);
				}
			} catch (err) {
				if (mounted) {
					setError(
						err instanceof Error ? err.message : "Failed to render diagram",
					);
					setIsLoading(false);
				}
			}
		}

		renderDiagram();

		return () => {
			mounted = false;
		};
	}, [chart]);

	if (error) {
		return (
			<div className={className}>
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
					<p className="font-semibold">Mermaid Error:</p>
					<p className="mt-1">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className={className}>
			{isLoading && (
				<div className="flex items-center justify-center p-8">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
				</div>
			)}
			<div ref={containerRef} className="mermaid-container" />
		</div>
	);
}

// Type augmentation for window.mermaid
declare global {
	interface Window {
		mermaid?: {
			initialize: (config: Record<string, unknown>) => void;
			render: (id: string, definition: string) => Promise<{ svg: string }>;
		};
	}
}
