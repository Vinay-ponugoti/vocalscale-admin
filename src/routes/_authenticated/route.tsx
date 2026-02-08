import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuth, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

const ProtectedLayout = () => {
  const { isLoaded, isSignedIn } = useAuth()
  console.log('ProtectedLayout State:', { isLoaded, isSignedIn })

  if (!isLoaded) return null

  return (
    <>
      <SignedIn>
        <AuthenticatedLayout />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export const Route = createFileRoute('/_authenticated')({
  component: ProtectedLayout,
})

