export function Logo({ className = "h-6", invert = false }: { className?: string; invert?: boolean }) {
  return (
    <svg viewBox="0 0 73 24" className={className} aria-label="Uber">
      <path
        fill={invert ? "#fff" : "#000"}
        d="M11.3 24H0V0h11.4c6.4 0 10.5 4.2 10.5 9.9v.2c0 5.8-4.2 10-10.6 10zm-.3-4.7c3.4 0 5.6-2.3 5.6-5.2v-.2c0-3-2.2-5.2-5.6-5.2H5.2v10.6h5.8zM37.7 24h-5.1L24 0h5.6l5.6 17.4L40.8 0h5.4L37.7 24zm17.4 0h-5.1V0h5.1v24zM73 4.7H59.7V0H73v4.7zm-8.2 19.3h-5.1V9.4H73v4.6h-8.2V24z"
      />
    </svg>
  );
}
