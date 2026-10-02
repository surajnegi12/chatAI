export default function Input({
  label,
  id,
  type = "text",
  error,
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full px-3.5 py-2.5 bg-neutral-900 border rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 transition-all ${
          error
            ? "border-red-500 focus:ring-red-500/50"
            : "border-neutral-700 focus:border-blue-500 focus:ring-blue-500/30"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}