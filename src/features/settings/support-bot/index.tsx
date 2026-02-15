import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bot, Zap, Clock, MessageSquare, Shield, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { supportApi } from '@/api/support'

export function SettingsSupportBot() {
  const [autoReply, setAutoReply] = useState(true)
  const [autoEscalate, setAutoEscalate] = useState(true)
  const [collectFeedback, setCollectFeedback] = useState(true)
  const [showSources, setShowSources] = useState(false)
  const [escalationThreshold, setEscalationThreshold] = useState('3')
  const [responseStyle, setResponseStyle] = useState('professional')
  const [maxResponseLength, setMaxResponseLength] = useState('500')
  const [greetingMessage, setGreetingMessage] = useState(
    'Hi there! I am the VocalScale Support Bot. How can I help you today?'
  )
  const [fallbackMessage, setFallbackMessage] = useState(
    "I'm sorry, I couldn't find an answer to your question. Let me connect you with a human agent."
  )
  const [escalationRules, setEscalationRules] = useState('refund,billing,cancel,complaint,urgent')

  const { data: health } = useQuery({
    queryKey: ['kp-health'],
    queryFn: supportApi.getProcessorHealth,
    refetchInterval: 30000,
  })

  const { data: metrics } = useQuery({
    queryKey: ['kp-metrics'],
    queryFn: supportApi.getProcessorMetrics,
    refetchInterval: 30000,
  })

  const handleSave = () => {
    toast.success('Support bot settings saved')
  }

  const botStatus = health?.status === 'healthy' ? 'online' : health?.status === 'degraded' ? 'degraded' : 'offline'

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>Support Bot Configuration</h3>
        <p className='text-sm text-muted-foreground'>
          Configure how the AI support bot responds to customer inquiries.
        </p>
      </div>
      <Separator className='my-4 flex-none' />
      <div className='faded-bottom h-full w-full overflow-y-auto scroll-smooth pe-4 pb-12'>
        <div className='space-y-6'>
          {/* Bot Status */}
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <Bot className='h-4 w-4' />
                  Bot Status
                </CardTitle>
                <Badge
                  variant={botStatus === 'online' ? 'default' : botStatus === 'degraded' ? 'secondary' : 'destructive'}
                >
                  {botStatus === 'online' && <span className='mr-1.5 h-2 w-2 rounded-full bg-green-400 inline-block' />}
                  {botStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4 text-sm lg:grid-cols-4'>
                <div className='rounded-lg border p-3'>
                  <p className='text-xs text-muted-foreground'>Total Chats</p>
                  <p className='text-xl font-semibold'>{metrics?.chat_requests_total || 0}</p>
                </div>
                <div className='rounded-lg border p-3'>
                  <p className='text-xs text-muted-foreground'>Successful</p>
                  <p className='text-xl font-semibold text-green-600'>{metrics?.chat_success_total || 0}</p>
                </div>
                <div className='rounded-lg border p-3'>
                  <p className='text-xs text-muted-foreground'>Errors</p>
                  <p className='text-xl font-semibold text-red-600'>{metrics?.chat_errors_total || 0}</p>
                </div>
                <div className='rounded-lg border p-3'>
                  <p className='text-xs text-muted-foreground'>Rate Limited</p>
                  <p className='text-xl font-semibold text-yellow-600'>{metrics?.rate_limit_exceeded || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto-Reply Settings */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Zap className='h-4 w-4' />
                Auto-Reply
              </CardTitle>
              <CardDescription>
                Control how the bot automatically responds to incoming support tickets.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-sm font-medium'>Enable Auto-Reply</Label>
                  <p className='text-xs text-muted-foreground'>
                    Bot will automatically generate and send initial responses to new tickets.
                  </p>
                </div>
                <Switch checked={autoReply} onCheckedChange={setAutoReply} />
              </div>

              <Separator />

              <div className='space-y-2'>
                <Label className='text-sm'>Response Style</Label>
                <Select value={responseStyle} onValueChange={setResponseStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='professional'>Professional & Formal</SelectItem>
                    <SelectItem value='friendly'>Friendly & Casual</SelectItem>
                    <SelectItem value='concise'>Short & Concise</SelectItem>
                    <SelectItem value='detailed'>Detailed & Thorough</SelectItem>
                  </SelectContent>
                </Select>
                <p className='text-xs text-muted-foreground'>
                  Sets the tone for AI-generated responses.
                </p>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm'>Max Response Length (words)</Label>
                <Input
                  type='number'
                  value={maxResponseLength}
                  onChange={(e) => setMaxResponseLength(e.target.value)}
                  min={50}
                  max={2000}
                />
                <p className='text-xs text-muted-foreground'>
                  Maximum number of words in auto-generated replies.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Greeting & Fallback */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <MessageSquare className='h-4 w-4' />
                Messages
              </CardTitle>
              <CardDescription>
                Customize the greeting and fallback messages shown to customers.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label className='text-sm'>Greeting Message</Label>
                <Textarea
                  value={greetingMessage}
                  onChange={(e) => setGreetingMessage(e.target.value)}
                  placeholder='Enter greeting message...'
                  rows={3}
                />
                <p className='text-xs text-muted-foreground'>
                  Shown when a customer opens the support chat widget.
                </p>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm'>Fallback Message</Label>
                <Textarea
                  value={fallbackMessage}
                  onChange={(e) => setFallbackMessage(e.target.value)}
                  placeholder='Enter fallback message...'
                  rows={3}
                />
                <p className='text-xs text-muted-foreground'>
                  Shown when the bot cannot find an answer in the knowledge base.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Escalation Rules */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Shield className='h-4 w-4' />
                Escalation Rules
              </CardTitle>
              <CardDescription>
                Define when tickets should be automatically escalated to human agents.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-sm font-medium'>Auto-Escalate</Label>
                  <p className='text-xs text-muted-foreground'>
                    Automatically escalate tickets when criteria are met.
                  </p>
                </div>
                <Switch checked={autoEscalate} onCheckedChange={setAutoEscalate} />
              </div>

              <Separator />

              <div className='space-y-2'>
                <Label className='text-sm'>Escalation After N Failed Attempts</Label>
                <Input
                  type='number'
                  value={escalationThreshold}
                  onChange={(e) => setEscalationThreshold(e.target.value)}
                  min={1}
                  max={10}
                />
                <p className='text-xs text-muted-foreground'>
                  Number of times the bot fails to resolve before escalating to a human.
                </p>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm'>Keyword Triggers (comma-separated)</Label>
                <Input
                  value={escalationRules}
                  onChange={(e) => setEscalationRules(e.target.value)}
                  placeholder='refund, cancel, billing...'
                />
                <p className='text-xs text-muted-foreground'>
                  Tickets containing these keywords will be flagged for human review.
                </p>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-sm font-medium'>Collect Customer Feedback</Label>
                  <p className='text-xs text-muted-foreground'>
                    Ask customers to rate their support experience after resolution.
                  </p>
                </div>
                <Switch checked={collectFeedback} onCheckedChange={setCollectFeedback} />
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-sm font-medium'>Show Knowledge Sources</Label>
                  <p className='text-xs text-muted-foreground'>
                    Display knowledge base sources referenced in bot responses.
                  </p>
                </div>
                <Switch checked={showSources} onCheckedChange={setShowSources} />
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <div className='flex justify-end'>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
