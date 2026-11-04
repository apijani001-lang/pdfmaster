
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Sparkles,
} from "lucide-react";

const toolDetails: Record<
  string,
  { title: string; description: string }
> = {
  "split-pdf": {
    title: "Split PDF",
    description: "Split your PDF into separate files.",
  },
  "compress-pdf": {
    title: "Compress PDF",
    description: "Reduce the size of your PDF file.",
  },
  "pdf-to-word": {
    title: "PDF to Word",
    description: "Convert PDF documents into Word files.",
  },
  "jpg-to-pdf": {
    title: "JPG to PDF",
    description: "Convert your images into a PDF document.",
  },
  "protect-pdf": {
    title: "Protect PDF",
    description: "Protect your PDF documents.",
  },
};

export function generateStaticParams() {
  return Object.keys(toolDetails).map((tool) => ({
    tool,
  }));
}

export default async function ToolComingSoonPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const details = toolDetails[tool];

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            Page Not Found
          </h1>
          <Link href="/" className="underline">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
          <FileText size={38} />
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
          <Sparkles size={16} />
          PDFMaster Tool
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          {details.title}
        </h1>

        <p className="mb-8 text-gray-600">
          {details.description}
        </p>

        <p className="mb-8 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
          This tool is being prepared. Please check back soon.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-6 py-3 font-semibold text-white transition hover:bg-violet-800"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
