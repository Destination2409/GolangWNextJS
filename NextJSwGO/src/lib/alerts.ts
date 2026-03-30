import Swal from 'sweetalert2'

export const Alert = Swal.mixin({
  customClass: {
    popup: 'bg-card text-card-foreground border border-border shadow-lg rounded-xl',
    title: 'text-lg font-semibold text-foreground',
    htmlContainer: 'text-sm text-foreground/80',
    confirmButton: 'bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium mx-2 transition-colors focus:ring-2 focus:ring-ring focus:outline-none',
    cancelButton: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md font-medium mx-2 transition-colors focus:ring-2 focus:ring-ring focus:outline-none',
    denyButton: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 rounded-md font-medium mx-2 transition-colors focus:ring-2 focus:ring-ring focus:outline-none',
  },
  buttonsStyling: false,
  background: 'inherit',
})
