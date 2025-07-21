
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
`;