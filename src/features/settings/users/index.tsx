import { useState } from 'react'
import {
  Users,
  UserPlus,
  Shield,
  Search,
  MoreVertical,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'support_agent' | 'viewer'
  status: 'active' | 'invited' | 'disabled'
  lastActive: string
}

const mockAdminUsers: AdminUser[] = [
  {
    id: '1',
    name: 'Vinay',
    email: 'vinay@vocalscale.com',
    role: 'super_admin',
    status: 'active',
    lastActive: '2 minutes ago',
  },
  {
    id: '2',
    name: 'Support Agent',
    email: 'support@vocalscale.com',
    role: 'support_agent',
    status: 'active',
    lastActive: '1 hour ago',
  },
]

const roleConfig = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  admin: { label: 'Admin', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  support_agent: { label: 'Support Agent', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' },
}

export function SettingsUsers() {
  const [search, setSearch] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('support_agent')
  const [requireMfa, setRequireMfa] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('24')

  const filteredUsers = mockAdminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }
    toast.success(`Invitation sent to ${inviteEmail}`)
    setInviteEmail('')
  }

  const handleSave = () => {
    toast.success('User management settings saved')
  }

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>User Management</h3>
        <p className='text-sm text-muted-foreground'>
          Manage admin panel users, roles, and access permissions.
        </p>
      </div>
      <Separator className='my-4 flex-none' />
      <div className='faded-bottom h-full w-full overflow-y-auto scroll-smooth pe-4 pb-12'>
        <div className='space-y-6'>
          {/* Invite User */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <UserPlus className='h-4 w-4' />
                Invite Team Member
              </CardTitle>
              <CardDescription>
                Send an invitation to add a new admin panel user.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex gap-2'>
                <Input
                  type='email'
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder='email@example.com'
                  className='flex-1'
                />
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className='w-[160px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='admin'>Admin</SelectItem>
                    <SelectItem value='support_agent'>Support Agent</SelectItem>
                    <SelectItem value='viewer'>Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInvite}>
                  <Mail className='mr-1.5 h-4 w-4' />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <Users className='h-4 w-4' />
                  Team Members
                </CardTitle>
                <Badge variant='outline' className='text-xs'>
                  {mockAdminUsers.length} members
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search members...'
                  className='pl-8'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-9 w-9'>
                        <AvatarFallback className='text-xs'>
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='flex items-center gap-2'>
                          <p className='text-sm font-medium'>{user.name}</p>
                          {user.status === 'active' && (
                            <span className='h-2 w-2 rounded-full bg-green-500' />
                          )}
                        </div>
                        <p className='text-xs text-muted-foreground'>{user.email}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge className={`text-[10px] ${roleConfig[user.role]?.color}`}>
                        {roleConfig[user.role]?.label}
                      </Badge>
                      <span className='text-xs text-muted-foreground hidden sm:inline'>
                        {user.lastActive}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem>Edit Role</DropdownMenuItem>
                          <DropdownMenuItem>Reset Password</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className='text-destructive'>
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Role Permissions */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Shield className='h-4 w-4' />
                Role Permissions
              </CardTitle>
              <CardDescription>
                Define what each role can access in the admin panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left py-2 font-medium text-muted-foreground'>Permission</th>
                      <th className='text-center py-2 font-medium text-muted-foreground'>Super Admin</th>
                      <th className='text-center py-2 font-medium text-muted-foreground'>Admin</th>
                      <th className='text-center py-2 font-medium text-muted-foreground'>Support</th>
                      <th className='text-center py-2 font-medium text-muted-foreground'>Viewer</th>
                    </tr>
                  </thead>
                  <tbody className='text-xs'>
                    {[
                      { perm: 'View Dashboard', sa: true, a: true, s: true, v: true },
                      { perm: 'Manage Support Tickets', sa: true, a: true, s: true, v: false },
                      { perm: 'Process Refunds', sa: true, a: true, s: false, v: false },
                      { perm: 'Manage Users', sa: true, a: true, s: false, v: false },
                      { perm: 'View Analytics', sa: true, a: true, s: true, v: true },
                      { perm: 'Edit Knowledge Base', sa: true, a: true, s: false, v: false },
                      { perm: 'System Settings', sa: true, a: false, s: false, v: false },
                      { perm: 'API Configuration', sa: true, a: false, s: false, v: false },
                      { perm: 'Billing & Subscriptions', sa: true, a: true, s: false, v: false },
                    ].map((row) => (
                      <tr key={row.perm} className='border-b'>
                        <td className='py-2.5 font-medium'>{row.perm}</td>
                        <td className='text-center'>
                          {row.sa ? (
                            <CheckCircle2 className='h-4 w-4 text-green-500 mx-auto' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-400 mx-auto' />
                          )}
                        </td>
                        <td className='text-center'>
                          {row.a ? (
                            <CheckCircle2 className='h-4 w-4 text-green-500 mx-auto' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-400 mx-auto' />
                          )}
                        </td>
                        <td className='text-center'>
                          {row.s ? (
                            <CheckCircle2 className='h-4 w-4 text-green-500 mx-auto' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-400 mx-auto' />
                          )}
                        </td>
                        <td className='text-center'>
                          {row.v ? (
                            <CheckCircle2 className='h-4 w-4 text-green-500 mx-auto' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-400 mx-auto' />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Shield className='h-4 w-4' />
                Security
              </CardTitle>
              <CardDescription>
                Configure authentication and session security.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-sm font-medium'>Require MFA</Label>
                  <p className='text-xs text-muted-foreground'>
                    Require multi-factor authentication for all admin users.
                  </p>
                </div>
                <Switch checked={requireMfa} onCheckedChange={setRequireMfa} />
              </div>

              <Separator />

              <div className='space-y-2'>
                <Label className='text-sm'>Session Timeout (hours)</Label>
                <Input
                  type='number'
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  min={1}
                  max={168}
                />
                <p className='text-xs text-muted-foreground'>
                  Automatically log out users after this many hours of inactivity.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className='flex justify-end'>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
