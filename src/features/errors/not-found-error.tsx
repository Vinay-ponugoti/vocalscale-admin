import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, LogIn, UserPlus } from 'lucide-react'

export function NotFoundError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  const { isSignedIn } = useAuth()

  return (
    <div className='min-h-screen bg-gradient-to-b from-background via-background to-muted/30'>
      <div className='flex h-screen w-full flex-col items-center justify-center px-4'>
        {/* 404 Badge */}
        <div className='mb-8 rounded-full bg-primary/10 px-6 py-2'>
          <span className='text-sm font-medium text-primary'>Error 404</span>
        </div>

        {/* Main Content */}
        <h1 className='text-8xl font-bold text-primary/20 mb-4'>404</h1>
        <h2 className='text-2xl font-bold mb-2'>Page Not Found</h2>
        <p className='text-center text-muted-foreground max-w-md mb-8'>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-3'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Go Back
          </Button>

          {isSignedIn ? (
            <Button onClick={() => navigate({ to: '/dashboard' })}>
              <Home className='h-4 w-4 mr-2' />
              Back to Dashboard
            </Button>
          ) : (
            <>
              <Button variant='default' asChild>
                <Link to='/sign-in'>
                  <LogIn className='h-4 w-4 mr-2' />
                  Sign In
                </Link>
              </Button>
              <Button variant='secondary' asChild>
                <Link to='/sign-up'>
                  <UserPlus className='h-4 w-4 mr-2' />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

