const AdPlaceholder = ({ className = "", label = "Ad Space" }: { className?: string; label?: string }) => (
  <div className={`ad-placeholder min-h-[90px] ${className}`}>
    <span>{label}</span>
  </div>
);

export default AdPlaceholder;

