import { Toaster as SonnerToaster } from 'sonner'

export default function Toaster() {
  return (
    <SonnerToaster position="top-center" duration={3000} visibleToasts={3} />
  )
}
