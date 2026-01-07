import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { useToast } from '@hooks/useToast';

/**
 * ActionButton component
 * @param {Object} props - The component props
 * @param {string} props.variant - The variant of the button
 * @param {React.ElementType} props.icon - The icon to display
 * @param {string} props.label - The label of the button
 * @param {Function} props.onClick - The function to call when the button is clicked
 * @returns {JSX.Element} The ActionButton component
 */
function ActionButton({
  variant = 'primary',
  icon: Icon,
  label,
  onClick,
  loading = false,
  disabled = false,
  size = 'lg',
  className = '',
}) {
  const { triggerToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading || loading) return;

    setIsLoading(true);
    try {
      await onClick();
    } catch (error) {
      console.error('Action error:', error);
      triggerToast(
        'danger',
        'Action Failed',
        error.response?.data?.message || error.message || 'An error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showLoading = isLoading || loading;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || showLoading}
      className={`d-flex align-items-center justify-content-center gap-2 ${className}`}
      style={{ minWidth: '140px' }}
    >
      {showLoading ? (
        <>
          <Spinner animation="border" size="sm" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={20} />}
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}

export default ActionButton;

