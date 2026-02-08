import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

const ProtectedLayout = () => {
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

