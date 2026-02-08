import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SignIn, useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate({ to: '/dashboard' })
    }
  }, [isLoaded, isSignedIn, navigate])

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
