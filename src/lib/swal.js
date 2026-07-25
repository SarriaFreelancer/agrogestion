import Swal from 'sweetalert2';

const getThemeColors = () => {
  if (typeof window === 'undefined' || !document.documentElement) {
    return {
      primary: '#2E7D32',
      dark: '#1B5E20',
      background: '#ffffff',
      text: '#2c3e50',
    };
  }

  const styles = getComputedStyle(document.documentElement);

  return {
    primary: styles.getPropertyValue('--primary-color').trim() || '#2E7D32',
    dark: styles.getPropertyValue('--primary-dark').trim() || '#1B5E20',
    background: styles.getPropertyValue('--glass-bg').trim() || '#ffffff',
    text: styles.getPropertyValue('--text-main').trim() || '#2c3e50',
  };
};

const buildBaseOptions = () => {
  const theme = getThemeColors();

  return {
    background: theme.background,
    color: theme.text,
    confirmButtonColor: theme.primary,
    cancelButtonColor: theme.dark,
    buttonsStyling: true,
    focusConfirm: false,
    reverseButtons: true,
    width: 'min(92vw, 34rem)',
    customClass: {
      popup: 'swal2-themed-popup',
    },
  };
};

export const swalMessage = (message, icon = 'info', title = '') => {
  const content = String(message ?? '');
  return Swal.fire({
    ...buildBaseOptions(),
    title: title || undefined,
    text: content,
    icon,
    confirmButtonText: 'Aceptar',
  });
};

export const swalSuccess = (message, title = 'Éxito') => Swal.fire({
  ...buildBaseOptions(),
  title,
  text: String(message ?? ''),
  icon: 'success',
  confirmButtonText: 'Aceptar',
});

export const swalError = (message, title = 'Error') => Swal.fire({
  ...buildBaseOptions(),
  title,
  text: String(message ?? ''),
  icon: 'error',
  confirmButtonText: 'Aceptar',
});

export const swalConfirm = async (message, options = {}) => {
  const result = await Swal.fire({
    ...buildBaseOptions(),
    title: options.title || 'Confirmación',
    text: String(message ?? ''),
    icon: options.icon || 'warning',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'Sí, continuar',
    cancelButtonText: options.cancelButtonText || 'Cancelar',
  });

  return result.isConfirmed;
};

export const confirmDialog = swalConfirm;

if (typeof window !== 'undefined' && !window.__agroSweetAlertPatched) {
  window.__agroSweetAlertPatched = true;
  window.alert = (message) => {
    void swalMessage(message);
  };
}
