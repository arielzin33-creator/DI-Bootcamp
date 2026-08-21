export default function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex justify-center items-center gap-3 py-10" role="status">
      <span className="loading loading-spinner loading-lg text-primary" />
      <span className="text-base-content/70">{label}</span>
    </div>
  );
}
