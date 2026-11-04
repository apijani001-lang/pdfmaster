
"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
  Minimize2,
} from "lucide-react";

type CompressionLevel = "high" | "medium" | "low";

const compressionOptions: {
  value: CompressionLevel;
  title: string;
  description: string;
}[] = [
  {
    value: "high",
    title: "Maximum Compression",
    description: "Smaller file, lower image quality",
  },
  {
    value: "medium",
    title: "Recommended",
    description: "Balanced file size and quality",
  },
  {
    value: "low",
    title: "Less Compression",
    description: "Better image quality, larger file",
  },
];

const settings = {
  high: { scale: 0.85, quality: 0.45 },
  medium: { scale: 1.15, quality: 0.65 },
  low: { scale: 1.5, quality: 0.82 },
};

const relatedTools = [
  {
    title: "Merge PDF",
    description: "Combine multiple PDF documents into one file.",
    href: "/tools/merge-pdf",
  },
  {
    title: "Split PDF",
    description: "Separate a PDF into individual pages.",
    href: "/tools/split-pdf",
  },
  {
    title: "PDF to Word",
    description: "Convert PDF documents into Word files.",
    href: "/tools/pdf-to-word",
  },
  {
    title: "PDF to JPG",
    description: "Convert PDF pages into JPG images.",
    href: "/tools/pdf-to-jpg",
  },
  {
    title: "JPG to PDF",
    description: "Turn JPG images into a PDF document.",
    href: "/tools/jpg-to-pdf",
  },
  {
    title: "Word to PDF",
    description: "Convert Word documents into PDF files.",
    href: "/tools/word-to-pdf",
  },
  {
    title: "Protect PDF",
    description: "Protect your PDF documents with a password.",
    href: "/tools/protect-pdf",
  },
];

const faqs = [
  {
    question: "How can I compress a PDF file online?",
    answer:
      "Upload your PDF file, select a compression level and click Compress PDF Now. When processing finishes, compare the original and new file sizes and download your compressed PDF.",
  },
  {
    question: "Is this PDF compressor free to use?",
    answer:
      "PDFMaster provides this PDF compression tool for free. You can upload a PDF, choose a compression level and download the processed document without creating an account.",
  },
  {
    question: "Which compression level should I choose?",
    answer:
      "Choose Maximum Compression when a smaller file is your priority. Recommended offers a balance between size and image quality. Less Compression uses higher image quality and may produce a larger file.",
  },
  {
    question: "Will compressing a PDF reduce its quality?",
    answer:
      "This tool converts PDF pages into JPEG images. Image quality can change depending on the selected compression level. Maximum Compression uses lower image quality, while Less Compression aims to retain more visual detail.",
  },
  {
    question: "Will my PDF text remain selectable after compression?",
    answer:
      "No. This tool converts each page into an image, so text will no longer be selectable or searchable. Links, forms, bookmarks and other interactive PDF elements are also not preserved.",
  },
  {
    question: "Why is my compressed PDF sometimes larger?",
    answer:
      "Some PDFs are already highly optimized or contain content that does not compress efficiently as JPEG images. In those cases, the processed PDF may be the same size or larger than the original.",
  },
  {
    question: "Are my PDF files uploaded to a server?",
    answer:
      "The PDF processing in this tool takes place in your browser. Your selected document is processed locally on your device rather than being sent to a PDFMaster processing server.",
  },
];

export default function CompressPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>("medium");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const selectFile = (selected?: File) => {
    if (!selected) return;

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      return;
    }

    if (resultUrl) URL.revokeObjectURL(resultUrl);

    setFile(selected);
    setOriginalSize(selected.size);
    setResultUrl("");
    setResultSize(0);
    setProgress(0);
    setError("");
    setSuccess("");
  };

  const reset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);

    setFile(null);
    setResultUrl("");
    setResultSize(0);
    setOriginalSize(0);
    setProgress(0);
    setError("");
    setSuccess("");
  };

  const canvasToJpeg = (
    canvas: HTMLCanvasElement,
    quality: number
  ): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error("Unable to convert PDF page to JPEG."));
            return;
          }

          try {
            const buffer = await blob.arrayBuffer();
            resolve(new Uint8Array(buffer));
          } catch (err) {
            reject(err);
          }
        },
        "image/jpeg",
        quality
      );
    });
  };

  const compressPDF = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setProgress(0);

    let temporaryUrl = "";
    let loadingTask:
      | import("pdfjs-dist/types/src/display/api").PDFDocumentLoadingTask
      | null = null;

    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

      const inputBytes = new Uint8Array(await file.arrayBuffer());

      loadingTask = pdfjs.getDocument({
        data: inputBytes,
      });

      const sourcePDF = await loadingTask.promise;
      const outputPDF = await PDFDocument.create();

      const totalPages = sourcePDF.numPages;
      const selectedSettings = settings[level];

      if (totalPages === 0) {
        throw new Error("This PDF does not contain any pages.");
      }

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const sourcePage = await sourcePDF.getPage(pageNumber);

        const originalViewport = sourcePage.getViewport({
          scale: 1,
        });

        const renderViewport = sourcePage.getViewport({
          scale: selectedSettings.scale,
        });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Your browser could not create a canvas.");
        }

        canvas.width = Math.ceil(renderViewport.width);
        canvas.height = Math.ceil(renderViewport.height);

        await sourcePage.render({
          canvasContext: context,
          viewport: renderViewport,
        }).promise;

        const jpegBytes = await canvasToJpeg(
          canvas,
          selectedSettings.quality
        );

        const embeddedImage = await outputPDF.embedJpg(jpegBytes);

        const outputPage = outputPDF.addPage([
          originalViewport.width,
          originalViewport.height,
        ]);

        outputPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: originalViewport.width,
          height: originalViewport.height,
        });

        canvas.width = 0;
        canvas.height = 0;

        sourcePage.cleanup();

        setProgress(
          Math.round((pageNumber / totalPages) * 100)
        );
      }

      await loadingTask.destroy();
      loadingTask = null;

      const outputBytes = await outputPDF.save();

      const blob = new Blob(
        [outputBytes.buffer as ArrayBuffer],
        { type: "application/pdf" }
      );

      temporaryUrl = URL.createObjectURL(blob);

      setResultUrl(temporaryUrl);
      setResultSize(blob.size);

      const reduction =
        originalSize > 0
          ? Math.round((1 - blob.size / originalSize) * 100)
          : 0;

      if (reduction > 0) {
        setSuccess(
          `PDF processed successfully! File size reduced by ${reduction}%.`
        );
      } else {
        setSuccess(
          "PDF processed successfully. The new file is not smaller. Try Maximum Compression."
        );
      }
    } catch (err) {
      console.error("PDF compression error:", err);

      if (temporaryUrl) {
        URL.revokeObjectURL(temporaryUrl);
      }

      const message =
        err instanceof Error ? err.message : "Unknown error";

      setError(`Unable to compress this PDF: ${message}`);
    } finally {
      if (loadingTask) {
        try {
          await loadingTask.destroy();
        } catch (destroyError) {
          console.warn("PDF cleanup warning:", destroyError);
        }
      }

      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!resultUrl) return;

    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "compressed-pdf.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <main className="compress-page">
      <section className="compress-hero">
        <div className="compress-hero-icon">
          <Minimize2 size={30} />
        </div>

        <span className="compress-eyebrow">PDFMASTER TOOL</span>

        <h1>Compress PDF Online for Free</h1>

        <p>
          Reduce your PDF file size to make documents easier to
          share, upload and store. Upload your PDF, choose a
          compression level and download your processed file.
        </p>
      </section>

      <section className="compress-workspace">
        {!file ? (
          <label className="compress-dropzone">
            <input
              type="file"
              accept="application/pdf,.pdf"
              hidden
              onChange={(event) => {
                selectFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <div className="compress-upload-icon">
              <Upload size={30} />
            </div>

            <h2>Upload Your PDF</h2>
            <p>Choose a PDF document from your device</p>

            <span className="compress-upload-button">
              Select PDF File
            </span>

            <small>PDF files only</small>
          </label>
        ) : (
          <>
            <div className="compress-selected-file">
              <div className="compress-file-icon">
                <FileText size={27} />
              </div>

              <div className="compress-file-info">
                <strong>{file.name}</strong>
                <span>{formatSize(originalSize)}</span>
              </div>

              {!loading && (
                <button
                  className="compress-remove"
                  onClick={reset}
                  aria-label="Remove PDF"
                >
                  <Trash2 size={19} />
                </button>
              )}
            </div>

            <div className="compress-options">
              <h2>Choose Compression Level</h2>

              <div className="compress-option-list">
                {compressionOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`compress-option ${
                      level === option.value ? "selected" : ""
                    }`}
                    onClick={() => setLevel(option.value)}
                    disabled={loading}
                  >
                    <span className="compress-radio">
                      {level === option.value && <span />}
                    </span>

                    <span className="compress-option-text">
                      <strong>{option.title}</strong>
                      <small>{option.description}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="compress-progress">
                <div className="compress-progress-heading">
                  <span>Compressing your PDF...</span>
                  <strong>{progress}%</strong>
                </div>

                <div className="compress-progress-track">
                  <div
                    className="compress-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {!resultUrl && (
              <button
                className="compress-main-button"
                onClick={compressPDF}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="compress-spinner" size={20} />
                    Compressing...
                  </>
                ) : (
                  <>
                    <Minimize2 size={20} />
                    Compress PDF Now
                  </>
                )}
              </button>
            )}
          </>
        )}

        {error && (
          <div className="compress-error">
            <X size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="compress-success">
            <CheckCircle2 size={19} />
            <span>{success}</span>
          </div>
        )}

        {resultUrl && (
          <div className="compress-result">
            <div className="compress-result-heading">
              <CheckCircle2 size={27} />
              <div>
                <h2>Your PDF is Ready!</h2>
                <p>Compare your original and compressed file sizes.</p>
              </div>
            </div>

            <div className="compress-size-comparison">
              <div>
                <span>Original Size</span>
                <strong>{formatSize(originalSize)}</strong>
              </div>

              <div>
                <span>New Size</span>
                <strong>{formatSize(resultSize)}</strong>
              </div>
            </div>

            <button
              className="compress-download-button"
              onClick={downloadPDF}
            >
              <Download size={19} />
              Download Compressed PDF
            </button>

            <button
              className="compress-again-button"
              onClick={reset}
            >
              Compress Another PDF
            </button>
          </div>
        )}
      </section>

      <section className="compress-features">
        <div>
          <Minimize2 size={23} />
          <h3>Three Compression Levels</h3>
          <p>
            Choose the image quality and compression setting
            that suits your document.
          </p>
        </div>

        <div>
          <FileText size={23} />
          <h3>Simple PDF Compression</h3>
          <p>
            Select a PDF, process it in your browser and
            download the resulting document.
          </p>
        </div>

        <div>
          <CheckCircle2 size={23} />
          <h3>Browser-Based Processing</h3>
          <p>
            Your document is processed locally in your browser
            instead of being sent to a processing server.
          </p>
        </div>
      </section>

      <section className="compress-seo-section">
        <h2>Reduce PDF File Size with PDFMaster</h2>

        <p>
          Large PDF files can be difficult to email, upload or
          share online. PDFMaster&apos;s free PDF compressor
          helps you create a smaller PDF by converting its pages
          into compressed JPEG images. This can be useful when
          you need a document that is easier to store or send.
        </p>

        <p>
          You can choose between Maximum Compression,
          Recommended and Less Compression. Each setting uses
          different image dimensions and JPEG quality. The best
          option depends on the contents of your PDF and
          whether smaller file size or clearer images are more
          important to you.
        </p>

        <h2>How to Compress a PDF File</h2>

        <ol className="compress-steps">
          <li>
            <strong>Upload your PDF:</strong> Select a PDF
            document from your computer or device.
          </li>
          <li>
            <strong>Choose a compression level:</strong> Select
            Maximum Compression, Recommended or Less Compression.
          </li>
          <li>
            <strong>Start compression:</strong> Click the
            Compress PDF Now button and wait for processing.
          </li>
          <li>
            <strong>Compare file sizes:</strong> Review the
            original and newly generated PDF sizes.
          </li>
          <li>
            <strong>Download your PDF:</strong> Save the
            processed document to your device.
          </li>
        </ol>

        <h2>Choose the Right PDF Compression Level</h2>

        <div className="compress-level-grid">
          <div>
            <h3>Maximum Compression</h3>
            <p>
              Uses lower image quality and smaller rendering
              dimensions. Choose it when reducing file size is
              your main priority.
            </p>
          </div>

          <div>
            <h3>Recommended Compression</h3>
            <p>
              Offers a middle setting for image dimensions and
              JPEG quality. It is a useful starting point for
              many ordinary documents.
            </p>
          </div>

          <div>
            <h3>Less Compression</h3>
            <p>
              Uses higher image quality and larger rendering
              dimensions. Choose it when visual detail is more
              important than file size.
            </p>
          </div>
        </div>

        <h2>Why Compress PDF Documents?</h2>

        <ul className="compress-benefits">
          <li>
            Make large PDF documents easier to share through
            email and messaging services.
          </li>
          <li>
            Reduce the amount of storage space used by some
            PDF files.
          </li>
          <li>
            Prepare documents for websites and online upload
            forms with file-size limits.
          </li>
          <li>
            Choose a compression setting based on your
            preferred image quality.
          </li>
        </ul>

        <div className="compress-seo-notice">
          <strong>Important information:</strong> This tool
          converts every PDF page into a JPEG image. The
          resulting document will not retain selectable or
          searchable text, clickable links, forms, bookmarks
          or other interactive PDF elements. Some PDFs may
          become larger after processing. Always check the
          output before replacing your original document.
        </div>
      </section>

      <section className="compress-faq-section">
        <h2>Frequently Asked Questions</h2>

        <p className="compress-faq-intro">
          Find answers to common questions about compressing
          PDF documents with PDFMaster.
        </p>

        <div className="compress-faq-list">
          {faqs.map((faq, index) => (
            <details className="compress-faq-item" key={index}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="compress-related-section">
        <h2>Explore More Free PDF Tools</h2>

        <p>
          PDFMaster offers additional tools to help you work
          with PDF documents and images.
        </p>

        <div className="compress-related-grid">
          {relatedTools.map((tool) => (
            <a
              href={tool.href}
              className="compress-related-card"
              key={tool.href}
            >
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <span>Use Tool →</span>
            </a>
          ))}
        </div>
      </section>

      <style jsx>{`
        .compress-page {
          min-height: 80vh;
          padding: 65px 20px 80px;
          background: #f7f8fc;
          color: #101a35;
        }

        .compress-hero {
          max-width: 760px;
          margin: 0 auto 38px;
          text-align: center;
        }

        .compress-hero-icon {
          width: 65px;
          height: 65px;
          display: grid;
          place-items: center;
          margin: 0 auto 18px;
          border-radius: 20px;
          background: #eeeaff;
          color: #7255e8;
        }

        .compress-eyebrow {
          color: #7255e8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .compress-hero h1 {
          margin: 12px 0;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 900;
          letter-spacing: -1.8px;
          line-height: 1.2;
        }

        .compress-hero p {
          max-width: 620px;
          margin: 0 auto;
          color: #69738d;
          font-size: 15px;
          line-height: 1.8;
        }

        .compress-workspace {
          max-width: 820px;
          margin: 0 auto;
          padding: 25px;
          border: 1px solid #e3e8f2;
          border-radius: 23px;
          background: white;
          box-shadow: 0 18px 55px rgba(22, 34, 70, 0.07);
        }

        .compress-dropzone {
          min-height: 285px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed #cfc6f8;
          border-radius: 17px;
          background: #faf9ff;
          cursor: pointer;
          transition: 0.2s;
        }

        .compress-dropzone:hover {
          border-color: #7255e8;
          background: #f4f1ff;
        }

        .compress-upload-icon {
          width: 60px;
          height: 60px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: #eeeaff;
          color: #7255e8;
        }

        .compress-dropzone h2 {
          margin: 18px 0 5px;
          font-size: 21px;
        }

        .compress-dropzone p {
          margin: 0 0 18px;
          color: #69738d;
          font-size: 13px;
        }

        .compress-upload-button,
        .compress-main-button,
        .compress-download-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 13px 23px;
          border: 0;
          border-radius: 11px;
          background: #7255e8;
          color: white;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }

        .compress-upload-button:hover,
        .compress-main-button:hover,
        .compress-download-button:hover {
          background: #5940c7;
          transform: translateY(-2px);
        }

        .compress-dropzone small {
          margin-top: 15px;
          color: #929bb0;
          font-size: 11px;
        }

        .compress-selected-file {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          border: 1px solid #e3e8f2;
          border-radius: 14px;
          background: #faf9ff;
        }

        .compress-file-icon {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #eeeaff;
          color: #7255e8;
        }

        .compress-file-info {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .compress-file-info strong {
          overflow-wrap: anywhere;
          font-size: 14px;
        }

        .compress-file-info span {
          color: #8992a8;
          font-size: 12px;
        }

        .compress-remove {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 11px;
          background: #fff0f0;
          color: #d64b5b;
          cursor: pointer;
        }

        .compress-options {
          margin-top: 25px;
        }

        .compress-options h2 {
          margin: 0 0 14px;
          font-size: 18px;
        }

        .compress-option-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .compress-option {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          border: 1px solid #e3e8f2;
          border-radius: 12px;
          background: white;
          text-align: left;
          cursor: pointer;
          transition: 0.2s;
        }

        .compress-option.selected {
          border-color: #7255e8;
          background: #f8f6ff;
        }

        .compress-option:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .compress-radio {
          width: 19px;
          height: 19px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 2px solid #b7bfd0;
          border-radius: 50%;
        }

        .compress-option.selected .compress-radio {
          border-color: #7255e8;
        }

        .compress-radio span {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #7255e8;
        }

        .compress-option-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .compress-option-text strong {
          font-size: 13px;
        }

        .compress-option-text small {
          color: #8992a8;
          font-size: 11px;
        }

        .compress-main-button {
          width: 100%;
          margin-top: 22px;
          padding: 16px;
          font-size: 15px;
        }

        .compress-main-button:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .compress-spinner {
          animation: compress-spin 1s linear infinite;
        }

        @keyframes compress-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .compress-progress {
          margin-top: 23px;
        }

        .compress-progress-heading {
          display: flex;
          justify-content: space-between;
          margin-bottom: 9px;
          color: #69738d;
          font-size: 12px;
        }

        .compress-progress-heading strong {
          color: #7255e8;
        }

        .compress-progress-track {
          height: 9px;
          overflow: hidden;
          border-radius: 20px;
          background: #eeeaff;
        }

        .compress-progress-fill {
          height: 100%;
          border-radius: 20px;
          background: #7255e8;
          transition: width 0.2s;
        }

        .compress-error,
        .compress-success {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 16px;
          padding: 13px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .compress-error {
          background: #fff0f0;
          color: #c0394b;
        }

        .compress-success {
          background: #edfaf2;
          color: #21834a;
        }

        .compress-result {
          margin-top: 22px;
          padding: 20px;
          border: 1px solid #d8eddf;
          border-radius: 15px;
          background: #f5fcf7;
        }

        .compress-result-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #21834a;
        }

        .compress-result-heading h2 {
          margin: 0 0 4px;
          font-size: 18px;
        }

        .compress-result-heading p {
          margin: 0;
          color: #69738d;
          font-size: 12px;
        }

        .compress-size-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 20px 0;
        }

        .compress-size-comparison div {
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 14px;
          border: 1px solid #e3e8f2;
          border-radius: 11px;
          background: white;
        }

        .compress-size-comparison span {
          color: #69738d;
          font-size: 11px;
        }

        .compress-size-comparison strong {
          font-size: 17px;
        }

        .compress-download-button {
          width: 100%;
          padding: 15px;
        }

        .compress-again-button {
          width: 100%;
          margin-top: 11px;
          padding: 12px;
          border: 1px solid #d8eddf;
          border-radius: 10px;
          background: white;
          color: #21834a;
          font-weight: 800;
          cursor: pointer;
        }

        .compress-features {
          max-width: 950px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 45px auto 0;
        }

        .compress-features > div {
          padding: 22px;
          border: 1px solid #e3e8f2;
          border-radius: 16px;
          background: white;
        }

        .compress-features svg {
          color: #7255e8;
        }

        .compress-features h3 {
          margin: 12px 0 6px;
          font-size: 15px;
        }

        .compress-features p {
          margin: 0;
          color: #69738d;
          font-size: 12px;
          line-height: 1.7;
        }

        .compress-notice {
          max-width: 820px;
          margin: 25px auto 0;
          padding: 15px;
          border: 1px solid #e3e8f2;
          border-radius: 12px;
          background: white;
          color: #69738d;
          font-size: 12px;
          line-height: 1.7;
        }

        .compress-notice strong {
          color: #101a35;
        }

        .compress-seo-section,
        .compress-faq-section,
        .compress-related-section {
          max-width: 900px;
          margin: 55px auto 0;
          padding: 30px;
          border: 1px solid #e3e8f2;
          border-radius: 18px;
          background: white;
        }

        .compress-seo-section h2,
        .compress-faq-section h2,
        .compress-related-section h2 {
          margin: 28px 0 12px;
          color: #101a35;
          font-size: 23px;
          line-height: 1.35;
        }

        .compress-seo-section h2:first-child {
          margin-top: 0;
        }

        .compress-seo-section p,
        .compress-related-section > p {
          color: #69738d;
          font-size: 14px;
          line-height: 1.9;
        }

        .compress-steps,
        .compress-benefits {
          padding-left: 23px;
          color: #69738d;
          font-size: 14px;
          line-height: 2;
        }

        .compress-steps li,
        .compress-benefits li {
          margin-bottom: 8px;
        }

        .compress-steps strong {
          color: #101a35;
        }

        .compress-level-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 18px;
        }

        .compress-level-grid > div {
          padding: 18px;
          border: 1px solid #e3e8f2;
          border-radius: 13px;
          background: #faf9ff;
        }

        .compress-level-grid h3 {
          margin: 0 0 9px;
          font-size: 15px;
          line-height: 1.5;
        }

        .compress-level-grid p {
          margin: 0;
          font-size: 12px;
          line-height: 1.8;
        }

        .compress-seo-notice {
          margin-top: 25px;
          padding: 17px;
          border: 1px solid #e3e8f2;
          border-radius: 12px;
          background: #faf9ff;
          color: #69738d;
          font-size: 13px;
          line-height: 1.8;
        }

        .compress-seo-notice strong {
          color: #101a35;
        }

        .compress-faq-section h2,
        .compress-related-section h2 {
          margin-top: 0;
        }

        .compress-faq-intro {
          margin-bottom: 22px;
          color: #69738d;
          font-size: 14px;
          line-height: 1.8;
        }

        .compress-faq-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .compress-faq-item {
          padding: 17px;
          border: 1px solid #e3e8f2;
          border-radius: 12px;
          background: #fff;
        }

        .compress-faq-item summary {
          color: #101a35;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.6;
          cursor: pointer;
        }

        .compress-faq-item p {
          margin: 12px 0 0;
          color: #69738d;
          font-size: 13px;
          line-height: 1.8;
        }

        .compress-related-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-top: 22px;
        }

        .compress-related-card {
          display: block;
          padding: 18px;
          border: 1px solid #e3e8f2;
          border-radius: 13px;
          background: #faf9ff;
          color: inherit;
          text-decoration: none;
          transition: 0.2s;
        }

        .compress-related-card:hover {
          border-color: #7255e8;
          transform: translateY(-2px);
        }

        .compress-related-card h3 {
          margin: 0 0 7px;
          color: #101a35;
          font-size: 15px;
        }

        .compress-related-card p {
          margin: 0 0 12px;
          color: #69738d;
          font-size: 12px;
          line-height: 1.7;
        }

        .compress-related-card span {
          color: #7255e8;
          font-size: 12px;
          font-weight: 800;
        }

        @media (max-width: 700px) {
          .compress-level-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .compress-page {
            padding: 40px 13px 55px;
          }

          .compress-workspace {
            padding: 13px;
          }

          .compress-dropzone {
            min-height: 260px;
          }

          .compress-features {
            grid-template-columns: 1fr;
          }

          .compress-seo-section,
          .compress-faq-section,
          .compress-related-section {
            margin-top: 30px;
            padding: 19px;
          }

          .compress-seo-section h2,
          .compress-faq-section h2,
          .compress-related-section h2 {
            font-size: 20px;
          }

          .compress-related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
