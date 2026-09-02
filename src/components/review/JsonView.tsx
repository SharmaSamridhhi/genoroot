export function JsonView({ json }: { json: string }) {
  return (
    <pre className="max-w-full overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 font-mono text-xs whitespace-pre-wrap dark:border-neutral-800 dark:bg-neutral-900">
      {json}
    </pre>
  );
}
