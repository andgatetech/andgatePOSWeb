import Swal from 'sweetalert2';

/**
 * Reusable message notification utility using SweetAlert2
 * Shows a centered dialog with icon and message
 * @param msg - Message to display
 * @param type - Type of message: 'success', 'error', 'warning', or 'info'
 */
export const showMessage = (msg = '', type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const colorMap = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
    };

    Swal.fire({
        icon: type,
        title: msg,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        position: 'center',
        confirmButtonColor: colorMap[type],
        customClass: {
            popup: `swal2-${type}-popup`,
            icon: `swal2-${type}-icon`,
        },
    });
};

/**
 * Reusable confirmation dialog using SweetAlert2
 * @param title - Dialog title
 * @param text - Dialog message text
 * @param confirmButtonText - Text for confirm button (default: 'Yes, delete it!')
 * @param cancelButtonText - Text for cancel button (default: 'Cancel')
 * @param showToastOnConfirm - Show toast notification after confirmation (default: true)
 * @param confirmToastMessage - Toast message to show on confirm (optional)
 * @returns Promise<boolean> - true if confirmed, false if cancelled
 */
export const showConfirmDialog = async (
    title: string = 'Are you sure?',
    text: string = 'This action cannot be undone!',
    confirmButtonText: string = 'Yes, delete it!',
    cancelButtonText: string = 'Cancel',
    showToastOnConfirm: boolean = true,
    confirmToastMessage?: string
): Promise<boolean> => {
    const result = await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true,
    });

    // Show toast notification if confirmed and enabled
    if (result.isConfirmed && showToastOnConfirm && confirmToastMessage) {
        showMessage(confirmToastMessage, 'info');
    }

    return result.isConfirmed;
};

/**
 * Success confirmation dialog - shows a success message after an action
 * @param title - Success title
 * @param text - Success message
 * @param confirmButtonText - Text for OK button (default: 'OK')
 */
export const showSuccessDialog = (
    title: string = 'Success!',
    text: string = 'Your action was completed successfully.',
    confirmButtonText: string = 'OK',
    showCancelButton: boolean = false,
    cancelButtonText: string = 'Cancel'
) => {
    return Swal.fire({
        icon: 'success',
        title,
        text,
        confirmButtonColor: '#10b981',
        confirmButtonText,
        showCancelButton,
        cancelButtonText,
        customClass: {
            popup: 'swal2-success-popup',
            confirmButton: 'swal2-success-button',
            cancelButton: 'rounded-lg px-4 py-2 font-medium bg-gray-500 text-white ml-2',
        },
    });
};

/**
 * Error dialog - shows an error message
 * @param title - Error title
 * @param text - Error message
 * @param confirmButtonText - Text for OK button (default: 'OK')
 */
export const showErrorDialog = (title: string = 'Error!', text: string = 'Something went wrong. Please try again.', confirmButtonText: string = 'OK') => {
    Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonColor: '#ef4444',
        confirmButtonText,
        customClass: {
            popup: 'swal2-error-popup',
            confirmButton: 'swal2-error-button',
        },
    });
};
