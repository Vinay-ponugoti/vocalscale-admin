import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/clerk-react'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4'>
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl border',
          },
        }}
        fallbackRedirectUrl='/dashboard'
        signUpUrl='/sign-up'
      />
    </div>
  )
}
