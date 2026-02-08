import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Bot,
  LayoutDashboard,
  Lock,
  ShieldCheck,
  Zap,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    console.log('Landing Page Auth State:', { isLoaded, isSignedIn })
    if (isLoaded && isSignedIn) {
      console.log('Redirecting to dashboard...')
      navigate({ to: '/dashboard' })
    }
  }, [isSignedIn, isLoaded, navigate])

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-background via-background to-muted/30'>
      {/* Privacy meta tags (simulated via useEffect or head in Next.js, but for SPA we can use helmet or just plain tags) */}

      {/* Header */}
      <header className='fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg'>
        <nav className='container mx-auto flex h-16 items-center justify-between px-4'>
          <div className='flex items-center gap-2'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden'>
              <img src='/images/favicon.png' alt='VocalScale Logo' className='h-full w-full object-contain' />
            </div>
            <span className='text-xl font-bold'>VocalScale Admin</span>
          </div>

          <div className='flex items-center gap-3'>
            <Button variant='outline' asChild>
              <Link to='/sign-in'>Admin Login</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className='relative pt-32 pb-20 px-4'>
        <div className='container mx-auto text-center'>
          <div className='inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 mb-8 text-sm'>
            <Lock className='h-4 w-4 text-primary' />
            <span className='font-medium'>Restricted Access</span>
          </div>

          <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight'>
            Internal Control & <span className='text-primary'>Management Portal</span>
          </h1>

          <p className='mt-6 text-lg text-muted-foreground max-w-2xl mx-auto'>
            Centralized administration system for VocalScale voice AI infrastructure.
            Access is restricted to authorized developers and administrators only.
          </p>

          <div className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Button size='lg' className='h-12 px-8' asChild>
              <Link to='/sign-in'>
                Sign In to Dashboard <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </div>
        </div>

        {/* Background gradient */}
        <div className='absolute inset-0 -z-10 mx-auto max-w-4xl'>
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[128px]' />
        </div>
      </section>

      {/* Admin Features Section */}
      <section className='py-20 px-4'>
        <div className='container mx-auto'>
          <h2 className='text-3xl font-bold text-center mb-12'>
            System Capabilities
          </h2>

          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[
              {
                icon: LayoutDashboard,
                title: 'Infrastructure Overview',
                description:
                  'Monitor system health, call volume, and AI performance across all regions.',
              },
              {
                icon: Bot,
                title: 'Agent Orchestration',
                description:
                  'Deploy, update, and manage AI voice models and conversation flows.',
              },
              {
                icon: ShieldCheck,
                title: 'Identity Management',
                description:
                  'Securely manage administrator permissions and developer API keys.',
              },
              {
                icon: Zap,
                title: 'Direct Integration',
                description:
                  'Advanced tools for connecting voice infrastructure with core backend services.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className='rounded-xl border bg-card p-6'
              >
                <div className='h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4'>
                  <feature.icon className='h-6 w-6 text-primary' />
                </div>
                <h3 className='text-lg font-semibold mb-2'>{feature.title}</h3>
                <p className='text-sm text-muted-foreground'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t py-8 px-4'>
        <div className='container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2 opacity-50 transition-opacity hover:opacity-100'>
            <img src='/images/favicon.png' alt='VocalScale Logo' className='h-6 w-6 object-contain' />
            <span className='font-semibold'>VocalScale Admin</span>
          </div>
          <p className='text-sm text-muted-foreground'>
            © {new Date().getFullYear()} VocalScale Inc. Internal Use Only.
          </p>
        </div>
      </footer>
    </div>
  )
}

