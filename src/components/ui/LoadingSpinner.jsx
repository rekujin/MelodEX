export const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizeClass = {
    small: 'spinner-small',
    default: 'spinner-default',
    large: 'spinner-large'
  }[size];

  return (
    <div className={`loading-spinner ${sizeClass} ${className}`}>
      <div className="spinner"></div>
    </div>
  );
};
