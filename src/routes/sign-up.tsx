import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@clerk/clerk-react'

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4'>
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl border',
          },
        }}
        fallbackRedirectUrl='/dashboard'
        signInUrl='/sign-in'
      />
    </div>
  )
}
