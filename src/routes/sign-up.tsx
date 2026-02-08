import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SignUp, useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate({ to: '/dashboard' })
    }
  }, [isLoaded, isSignedIn, navigate])

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
