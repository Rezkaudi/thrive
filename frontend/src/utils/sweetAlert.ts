// frontend/src/utils/sweetAlert.ts
import Swal from 'sweetalert2'

const MySwal = Swal;

export interface SweetAlertOptions {
  title?: string;
  text?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

export const useSweetAlert = () => {
  const showAlert = (options: SweetAlertOptions) => {
    return MySwal.fire({
      title: options.title || 'Alert',
      text: options.text || '',
      icon: options.icon || 'info',
      confirmButtonText: options.confirmButtonText || 'OK',
      confirmButtonColor: options.confirmButtonColor || '#FF6B6B',
      customClass: {
        popup: 'sweet-alert-popup',
        title: 'sweet-alert-title',
        confirmButton: 'sweet-alert-confirm',
        cancelButton: 'sweet-alert-cancel',
      },
      ...options,
    });
  };

  const showConfirm = (options: SweetAlertOptions) => {
    return MySwal.fire({
      title: options.title || 'Are you sure?',
      text: options.text || '',
      icon: options.icon || 'warning',
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText || 'Yes',
      cancelButtonText: options.cancelButtonText || 'Cancel',
      confirmButtonColor: options.confirmButtonColor || '#FF6B6B',
      cancelButtonColor: options.cancelButtonColor || '#6C757D',
      customClass: {
        popup: 'sweet-alert-popup',
        title: 'sweet-alert-title',
        confirmButton: 'sweet-alert-confirm',
        cancelButton: 'sweet-alert-cancel',
      },
      ...options,
    });
  };

  const showSuccess = (title: string, text?: string) => {
    return showAlert({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'Great!',
    });
  };

  const showSuccessToast = (title: string, text?: string) => {
    return MySwal.fire({
      title,
      text,
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      showCloseButton: true,
      timer: 8000,
      timerProgressBar: false,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', MySwal.stopTimer);
        toast.addEventListener('mouseleave', MySwal.resumeTimer);
        // Force high z-index and add entrance animation
        const container = toast.closest('.swal2-container') as HTMLElement;
        if (container) {
          container.style.zIndex = '999999';
        }
        // Add sparkle effect
        setTimeout(() => {
          toast.classList.add('toast-sparkle');
        }, 200);
      },
      didClose: () => {
        // Add exit animation class for smooth departure
      },
      customClass: {
        popup: 'awesome-success-toast',
        title: 'awesome-toast-title',
        closeButton: 'awesome-close-button',
        container: 'awesome-toast-container'
      },
    });
  };

  const showError = (title: string, text?: string) => {
    return showAlert({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'OK',
    });
  };

  const showWarning = (title: string, text?: string) => {
    return showAlert({
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'OK',
    });
  };

  const showInfo = (title: string, text?: string) => {
    return showAlert({
      title,
      text,
      icon: 'info',
      confirmButtonText: 'OK',
    });
  };

  return {
    showAlert,
    showConfirm,
    showSuccess,
    showSuccessToast,
    showError,
    showWarning,
    showInfo,
  };
};

// CSS for custom styling (add to your global CSS)
export const sweetAlertStyles = `
.sweet-alert-popup {
  font-family: 'Inter', 'Noto Sans JP', 'Helvetica', 'Arial', sans-serif;
  border-radius: 16px !important;
}

.sweet-alert-title {
  font-weight: 600 !important;
  color: #2D3436 !important;
}

.sweet-alert-confirm {
  border-radius: 8px !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
}

.sweet-alert-confirm:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important;
}

.sweet-alert-cancel {
  border-radius: 8px !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
}

.sweet-alert-cancel:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important;
}

/* Toast Container - Ultra High Priority */
.awesome-toast-container,
.swal2-container.swal2-top-end {
  z-index: 999999 !important;
  pointer-events: none !important;
}

.awesome-toast-container .swal2-popup,
.swal2-container.swal2-top-end .swal2-popup {
  pointer-events: auto !important;
}

/* Awesome Success Toast - Premium Green Design */
.awesome-success-toast {
  font-family: 'Inter', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif !important;
  
  /* Solid Green Background */
  background: linear-gradient(135deg, 
    #22c55e 0%,
    #16a34a 25%,
    #15803d 75%,
    #166534 100%) !important;
    
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
  background-clip: padding-box !important;
  border-radius: 8px !important;
  position: relative !important;
  overflow: hidden !important;
  
  /* Epic Shadow System */
  box-shadow: 
    0 32px 64px -12px rgba(34, 197, 94, 0.6),
    0 20px 40px -8px rgba(0, 0, 0, 0.25),
    0 8px 24px -4px rgba(34, 197, 94, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    
  backdrop-filter: blur(24px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
  
  min-width: 360px !important;
  max-width: 480px !important;
  margin-top: 32px !important;
  margin-right: 32px !important;
  padding: 28px !important;
  
  /* Epic Entrance Animation */
  animation: awesomeToastEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
  
  /* Glow Effect */
  --glow-color: rgba(34, 197, 94, 0.8);
  filter: drop-shadow(0 0 20px var(--glow-color)) !important;
}

/* Sparkle Animation Effect */
.awesome-success-toast.toast-sparkle::before {
  content: '' !important;
  position: absolute !important;
  top: -50% !important;
  left: -50% !important;
  width: 200% !important;
  height: 200% !important;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.8) 50%, 
    transparent 70%) !important;
  animation: sparkleEffect 1.5s ease-out !important;
  pointer-events: none !important;
  z-index: 1 !important;
}

/* Floating Particles Background */
.awesome-success-toast::after {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255, 255, 255, 0.2), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(255, 255, 255, 0.4), transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.2), transparent) !important;
  animation: floatingParticles 4s ease-in-out infinite !important;
  pointer-events: none !important;
  z-index: 0 !important;
}

/* Epic Success Icon */
.awesome-success-toast .swal2-icon.swal2-success {
  border: 4px solid rgba(255, 255, 255, 0.8) !important;
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(12px) !important;
  width: 72px !important;
  height: 72px !important;
  margin: 0 auto 20px auto !important;
  position: relative !important;
  z-index: 2 !important;
  
  /* Icon Glow */
  box-shadow: 
    0 0 30px rgba(255, 255, 255, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.3) !important;
    
  /* Icon Animation */
  animation: iconPulse 2s ease-in-out infinite !important;
}

.awesome-success-toast .swal2-icon.swal2-success [class^='swal2-success-line'] {
  background-color: #ffffff !important;
  height: 4px !important;
  border-radius: 2px !important;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.4) !important;
}

.awesome-success-toast .swal2-icon.swal2-success .swal2-success-ring {
  border: 4px solid rgba(255, 255, 255, 0.8) !important;
  border-radius: 50% !important;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3) !important;
}

/* Epic Toast Title */
.awesome-toast-title {
  font-weight: 700 !important;
  font-size: 18px !important;
  color: #ffffff !important;
  line-height: 1.4 !important;
  margin: 0 !important;
  text-align: center !important;
  letter-spacing: -0.02em !important;
  position: relative !important;
  z-index: 2 !important;
  
  /* Text Shadow for Depth */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

/* Awesome Close Button */
.awesome-close-button {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 50% !important;
  width: 32px !important;
  height: 32px !important;
  position: absolute !important;
  top: 12px !important;
  right: 12px !important;
  color: #ffffff !important;
  font-size: 18px !important;
  font-weight: bold !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  z-index: 10 !important;
  
  /* Button Glow */
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

.awesome-close-button:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: scale(1.1) rotate(90deg) !important;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

/* Epic Progress Bar */
.awesome-toast-progress {
  background: linear-gradient(90deg, 
    #10b981 0%, 
    #22c55e 25%, 
    #34d399 50%, 
    #22c55e 75%, 
    #10b981 100%) !important;
  background-size: 200% 100% !important;
  height: 6px !important;
  border-radius: 3px !important;
  margin-top: 20px !important;
  position: relative !important;
  z-index: 2 !important;
  display: none !important; /* Hidden by default */
  
  /* Progress Glow */
  box-shadow: 
    0 0 20px rgba(34, 197, 94, 0.6),
    0 2px 8px rgba(34, 197, 94, 0.3) !important;
    
  /* Animated Gradient */
  animation: progressGlow 2s ease-in-out infinite !important;
}

/* Epic Animations */
@keyframes awesomeToastEntrance {
  0% {
    transform: translateX(120%) translateY(-20px) scale(0.8) rotate(5deg);
    opacity: 0;
    filter: blur(8px) drop-shadow(0 0 0px var(--glow-color));
  }
  25% {
    transform: translateX(-20px) translateY(-10px) scale(1.05) rotate(-2deg);
    opacity: 0.7;
    filter: blur(4px) drop-shadow(0 0 15px var(--glow-color));
  }
  50% {
    transform: translateX(10px) translateY(5px) scale(1.02) rotate(1deg);
    opacity: 0.9;
    filter: blur(2px) drop-shadow(0 0 25px var(--glow-color));
  }
  75% {
    transform: translateX(-5px) translateY(-2px) scale(1.01) rotate(-0.5deg);
    opacity: 0.95;
    filter: blur(1px) drop-shadow(0 0 30px var(--glow-color));
  }
  100% {
    transform: translateX(0) translateY(0) scale(1) rotate(0deg);
    opacity: 1;
    filter: blur(0px) drop-shadow(0 0 20px var(--glow-color));
  }
}

@keyframes sparkleEffect {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(180deg);
    opacity: 0;
  }
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 
      0 0 30px rgba(255, 255, 255, 0.5),
      inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 
      0 0 40px rgba(255, 255, 255, 0.7),
      inset 0 2px 4px rgba(255, 255, 255, 0.5);
  }
}

@keyframes progressGlow {
  0%, 100% {
    background-position: 0% 50%;
    box-shadow: 
      0 0 20px rgba(34, 197, 94, 0.6),
      0 2px 8px rgba(34, 197, 94, 0.3);
  }
  50% {
    background-position: 100% 50%;
    box-shadow: 
      0 0 30px rgba(34, 197, 94, 0.8),
      0 2px 12px rgba(34, 197, 94, 0.5);
  }
}

@keyframes floatingParticles {
  0%, 100% {
    opacity: 0.6;
    transform: translateY(0px);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-10px);
  }
}

/* Epic Hover Effects */
.awesome-success-toast:hover {
  transform: translateY(-8px) scale(1.02) !important;
  box-shadow: 
    0 40px 80px -12px rgba(34, 197, 94, 0.5),
    0 25px 50px -8px rgba(0, 0, 0, 0.2),
    0 12px 32px -4px rgba(34, 197, 94, 0.4),
    0 0 0 1px rgba(34, 197, 94, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  filter: drop-shadow(0 0 30px var(--glow-color)) !important;
}

.awesome-success-toast:hover .awesome-toast-title {
  transform: scale(1.02) !important;
  transition: transform 0.3s ease !important;
}

.awesome-success-toast:hover .swal2-icon.swal2-success {
  transform: scale(1.1) rotate(5deg) !important;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Responsive Design - Mobile Optimization */
@media (max-width: 640px) {
  .awesome-success-toast {
    min-width: 320px !important;
    max-width: 380px !important;
    margin-right: 20px !important;
    margin-top: 20px !important;
    padding: 24px !important;
  }
  
  .awesome-toast-title {
    font-size: 16px !important;
  }
  
  .awesome-success-toast .swal2-icon.swal2-success {
    width: 60px !important;
    height: 60px !important;
    margin-bottom: 16px !important;
  }
  
  .awesome-toast-progress {
    height: 5px !important;
    margin-top: 16px !important;
  }
}

/* Dark Mode - Epic Dark Theme */
@media (prefers-color-scheme: dark) {
  .awesome-success-toast {
    background: linear-gradient(135deg,
      #22c55e 0%,
      #16a34a 25%,
      #15803d 75%,
      #166534 100%) !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
    --glow-color: rgba(34, 197, 94, 0.8);
  }
  
  .awesome-toast-title {
    color: #ffffff !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
  }
  
  .awesome-close-button {
    background: rgba(255, 255, 255, 0.25) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
  }
  
  .awesome-close-button:hover {
    background: rgba(255, 255, 255, 0.35) !important;
    border-color: rgba(255, 255, 255, 0.6) !important;
  }
}

/* Performance Optimizations */
.awesome-success-toast,
.awesome-success-toast * {
  will-change: transform, opacity !important;
  transform-style: preserve-3d !important;
}
`;