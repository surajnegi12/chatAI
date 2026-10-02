export default function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 py-2.5 px-4 text-sm shadow-sm",
    secondary:
      "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 py-2.5 px-4 text-sm",
    ghost:
      "bg-transparent hover:bg-neutral-800 text-neutral-300 hover:text-white p-2",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}