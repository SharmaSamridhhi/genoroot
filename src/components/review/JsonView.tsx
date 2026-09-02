export function JsonView({ json }: { json: string }) {
  return (
    <pre className="border-line bg-sage text-ink max-w-full overflow-x-auto rounded-lg border p-4 font-mono text-xs whitespace-pre-wrap">
      {json}
    </pre>
  );
}
