export default function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  return (
    <div
      className={`animate-spin rounded-full border-neutral-600 border-t-blue-500 ${sizes[size]} ${className}`}
    />
  );
}