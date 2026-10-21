import Header from '@/components/layout/Header'

export default function MainLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}
