import { CircleAlert, CircleCheck, CircleX } from 'lucide-react'
import { Toaster as SonnerToaster } from 'sonner'

export default function Toaster() {
  return (
    <SonnerToaster
      className="lg:w-[520px]!"
      position="top-center"
      duration={3000}
      visibleToasts={1}
      richColors
      icons={{
        success: <CircleCheck size={20} strokeWidth={3} />,
        error: <CircleX size={20} strokeWidth={3} />,
        info: <CircleAlert size={20} strokeWidth={3} />,
      }}
      toastOptions={{
        classNames: {
          toast: 'h-[54px]! px-4! lg:h-[66px]! lg:w-[520px]! lg:px-6!',
          title: 'font-sans! text-sm! font-semibold! lg:text-base!',
        },
      }}
    />
  )
}
