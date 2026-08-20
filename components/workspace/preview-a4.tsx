export function PreviewA4({ title, html }: { title: string; html: string }) {
  return (
    <div className="overflow-auto rounded-md bg-muted p-6">
      <div className="a4-page">
        <h1 className="mb-4 text-xl font-semibold">{title}</h1>
        {/* Content is sanitized server-side (lib/validation/content-validator.ts)
            before it is ever stored, so rendering it here is safe. */}
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
