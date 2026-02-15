import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Server,
  Key,
  Shield,
  Globe,
  Activity,
  Gauge,
  Database,
  Cpu,
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
import { toast } from 'sonner'
import { supportApi } from '@/api/support'

export function SettingsSystem() {
  // LLM Config
  const [llmProvider, setLlmProvider] = useState('gemini')
  const [llmModel, setLlmModel] = useState('gemini-2.5-flash')
  const [llmTimeout, setLlmTimeout] = useState('60')
  const [temperature, setTemperature] = useState('0.6')

  // Rate Limits
  const [rateLimit, setRateLimit] = useState('60')
  const [rateLimitWindow, setRateLimitWindow] = useState('60')

  // Cache
  const [cacheEnabled, setCacheEnabled] = useState(true)
  const [cacheTtlBusiness, setCacheTtlBusiness] = useState('300')
  const [cacheTtlSearch, setCacheTtlSearch] = useState('60')

  // Logging
  const [debugMode, setDebugMode] = useState(false)
  const [costTracking, setCostTracking] = useState(true)
  const [dailyCostAlert, setDailyCostAlert] = useState('500')

  // CORS
  const [corsOrigins, setCorsOrigins] = useState(
    'https://www.vocalscale.com,https://app.vocalscale.com,http://localhost:3000,http://localhost:5173'
  )

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
    toast.success('System settings saved')
  }

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>System & API Configuration</h3>
        <p className='text-sm text-muted-foreground'>
          Manage LLM settings, rate limits, caching, and API configuration.
        </p>
      </div>
      <Separator className='my-4 flex-none' />
      <div className='faded-bottom h-full w-full overflow-y-auto scroll-smooth pe-4 pb-12'>
        <div className='space-y-6'>
          {/* System Health */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Activity className='h-4 w-4' />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-3 text-sm lg:grid-cols-3'>
                <div className='rounded-lg border p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <div className={`h-2 w-2 rounded-full ${health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p className='text-xs text-muted-foreground'>Knowledge Processor</p>
                  </div>
                  <p className='text-sm font-medium'>{health?.status || 'checking...'}</p>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <div className={`h-2 w-2 rounded-full ${health?.components?.redis?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p className='text-xs text-muted-foreground'>Redis Cache</p>
                  </div>
                  <p className='text-sm font-medium'>{health?.components?.redis?.status || 'N/A'}</p>
                </div>
                <div className='rounded-lg border p-3'>
                  <p className='text-xs text-muted-foreground'>LLM Requests</p>
                  <p className='text-sm font-medium'>{metrics?.llm_requests_total || 0} total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LLM Configuration */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Cpu className='h-4 w-4' />
                LLM Configuration
              </CardTitle>
              <CardDescription>
                Configure the AI model used for generating responses.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label className='text-sm'>LLM Provider</Label>
                <Select value={llmProvider} onValueChange={setLlmProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='gemini'>Google Gemini</SelectItem>
                    <SelectItem value='openai'>OpenAI</SelectItem>
                    <SelectItem value='anthropic'>Anthropic Claude</SelectItem>
                    <SelectItem value='together_ai'>Together AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm'>Model</Label>
                <Select value={llmModel} onValueChange={setLlmModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {llmProvider === 'gemini' && (
                      <>
                        <SelectItem value='gemini-2.5-flash'>Gemini 2.5 Flash (Fast)</SelectItem>
                        <SelectItem value='gemini-2.5-pro'>Gemini 2.5 Pro (Quality)</SelectItem>
                      </>
                    )}
                    {llmProvider === 'openai' && (
                      <>
                        <SelectItem value='gpt-4o-mini'>GPT-4o Mini (Fast)</SelectItem>
                        <SelectItem value='gpt-4o'>GPT-4o (Quality)</SelectItem>
                      </>
                    )}
                    {llmProvider === 'anthropic' && (
                      <>
                        <SelectItem value='claude-haiku-4-5-20251001'>Claude Haiku 4.5 (Fast)</SelectItem>
                        <SelectItem value='claude-sonnet-4-5-20250929'>Claude Sonnet 4.5 (Quality)</SelectItem>
                      </>
                    )}
                    {llmProvider === 'together_ai' && (
                      <>
                        <SelectItem value='meta-llama/Llama-3-70b-chat-hf'>Llama 3 70B</SelectItem>
                        <SelectItem value='mistralai/Mixtral-8x7B-Instruct-v0.1'>Mixtral 8x7B</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-sm'>Temperature</Label>
                  <Input
                    type='number'
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                  <p className='text-xs text-muted-foreground'>
                    0 = deterministic, 1 = creative
                  </p>
                </div>
                <div className='space-y-2'>
                  <Label className='text-sm'>Timeout (seconds)</Label>
                  <Input
                    type='number'
                    value={llmTimeout}
                    onChange={(e) => setLlmTimeout(e.target.value)}
                    min={10}
                    max={300}
                  />
                  <p className='text-xs text-muted-foreground'>
                    Max wait time for LLM response
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limiting */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Gauge className='h-4 w-4' />
                Rate Limiting
              </CardTitle>
              <CardDescription>
                Control API request limits to prevent abuse.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-sm'>Max Requests</Label>
                  <Input
                    type='number'
                    value={rateLimit}
                    onChange={(e) => setRateLimit(e.target.value)}
                    min={1}
                    max={1000}
                  />
                  <p className='text-xs text-muted-foreground'>
                    Requests per window per user
                  </p>
                </div>
                <div className='space-y-2'>
                  <Label className='text-sm'>Window (seconds)</Label>
                  <Input
                    type='number'
                    value={rateLimitWindow}
                    onChange={(e) => setRateLimitWindow(e.target.value)}
                    min={10}
                    max={3600}
                  />
                  <p className='text-xs text-muted-foreground'>
                    Time window for rate limiting
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cache Settings */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Database className='h-4 w-4' />
                Cache Configuration
              </CardTitle>
              <CardDescription>
                Configure Redis caching for performance optimization.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-sm font-medium'>Enable Caching</Label>
                  <p className='text-xs text-muted-foreground'>
                    Cache business context and search results in Redis.
                  </p>
                </div>
                <Switch checked={cacheEnabled} onCheckedChange={setCacheEnabled} />
              </div>

              <Separator />

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-sm'>Business Context TTL (sec)</Label>
                  <Input
                    type='number'
                    value={cacheTtlBusiness}
                    onChange={(e) => setCacheTtlBusiness(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-sm'>Search Results TTL (sec)</Label>
                  <Input
                    type='number'
                    value={cacheTtlSearch}
                    onChange={(e) => setCacheTtlSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Tracking */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Shield className='h-4 w-4' />
                Cost & Monitoring
              </CardTitle>
              <CardDescription>
                Track LLM usage costs and set up alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-sm font-medium'>Cost Tracking</Label>
                  <p className='text-xs text-muted-foreground'>
                    Log individual LLM requests and costs to Supabase.
                  </p>
                </div>
                <Switch checked={costTracking} onCheckedChange={setCostTracking} />
              </div>

              <Separator />

              <div className='space-y-2'>
                <Label className='text-sm'>Daily Cost Alert (cents)</Label>
                <Input
                  type='number'
                  value={dailyCostAlert}
                  onChange={(e) => setDailyCostAlert(e.target.value)}
                  min={100}
                  max={100000}
                />
                <p className='text-xs text-muted-foreground'>
                  Alert when daily cost per user exceeds this amount. 500 = $5/day.
                </p>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-sm font-medium'>Debug Mode</Label>
                  <p className='text-xs text-muted-foreground'>
                    Enable detailed logging. Not recommended for production.
                  </p>
                </div>
                <Switch checked={debugMode} onCheckedChange={setDebugMode} />
              </div>
            </CardContent>
          </Card>

          {/* CORS */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Globe className='h-4 w-4' />
                CORS & Security
              </CardTitle>
              <CardDescription>
                Configure allowed origins for API access.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label className='text-sm'>Allowed Origins (comma-separated)</Label>
                <Input
                  value={corsOrigins}
                  onChange={(e) => setCorsOrigins(e.target.value)}
                  placeholder='https://example.com, http://localhost:3000'
                />
                <p className='text-xs text-muted-foreground'>
                  Domains allowed to make API requests. Separate with commas.
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
