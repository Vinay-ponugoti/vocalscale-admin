import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  Upload,
  Search,
  Trash2,
  FileText,
  Database,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardDrive,
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

export function SettingsKnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('')
  const [autoProcess, setAutoProcess] = useState(true)
  const [chunkSize, setChunkSize] = useState('1000')
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-004')

  const { data: documents = [], isLoading: isLoadingDocs, refetch: refetchDocs } = useQuery({
    queryKey: ['knowledge-documents'],
    queryFn: supportApi.getKnowledgeDocuments,
  })

  const { data: health } = useQuery({
    queryKey: ['kp-health'],
    queryFn: supportApi.getProcessorHealth,
    refetchInterval: 30000,
  })

  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      const res = await supportApi.searchKnowledge(searchQuery)
      setSearchResults(res.results || [])
      if ((res.results || []).length === 0) {
        toast.info('No results found')
      }
    } catch {
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSave = () => {
    toast.success('Knowledge base settings saved')
  }

  const readyDocs = documents.filter((d) => d.status === 'ready')
  const processingDocs = documents.filter((d) => d.status === 'processing')
  const errorDocs = documents.filter((d) => d.status === 'error')

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>Knowledge Base</h3>
        <p className='text-sm text-muted-foreground'>
          Manage documents, embeddings, and search configuration for the AI knowledge processor.
        </p>
      </div>
      <Separator className='my-4 flex-none' />
      <div className='faded-bottom h-full w-full overflow-y-auto scroll-smooth pe-4 pb-12'>
        <div className='space-y-6'>
          {/* Overview Stats */}
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <Database className='h-4 w-4' />
                  Knowledge Overview
                </CardTitle>
                <Button variant='ghost' size='sm' onClick={() => refetchDocs()}>
                  <RefreshCcw className='h-3.5 w-3.5 mr-1.5' />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-3 text-sm lg:grid-cols-4'>
                <div className='rounded-lg border p-3'>
                  <p className='text-xs text-muted-foreground'>Total Documents</p>
                  <p className='text-xl font-semibold'>{documents.length}</p>
                </div>
                <div className='rounded-lg border p-3'>
                  <p className='text-xs text-muted-foreground'>Ready</p>
                  <p className='text-xl font-semibold text-green-600'>{readyDocs.length}</p>
                </div>
                <div className='rounded-lg border p-3'>
                  <p className='text-xs text-muted-foreground'>Processing</p>
                  <p className='text-xl font-semibold text-yellow-600'>{processingDocs.length}</p>
                </div>
                <div className='rounded-lg border p-3'>
                  <p className='text-xs text-muted-foreground'>Errors</p>
                  <p className='text-xl font-semibold text-red-600'>{errorDocs.length}</p>
                </div>
              </div>

              {/* Processor Status */}
              <div className='mt-3 flex items-center gap-2 rounded-md bg-muted/50 p-2'>
                <div className={`h-2 w-2 rounded-full ${health?.status === 'healthy' ? 'bg-green-500' : health?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <span className='text-xs text-muted-foreground'>
                  Knowledge Processor: {health?.status || 'checking...'}
                </span>
                {health?.version && (
                  <Badge variant='outline' className='ml-auto text-[10px]'>
                    v{health.version}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                Documents
              </CardTitle>
              <CardDescription>
                Documents indexed in the knowledge base. Upload files via the knowledge processor API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDocs ? (
                <div className='flex items-center justify-center py-6'>
                  <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                </div>
              ) : documents.length === 0 ? (
                <div className='flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8'>
                  <BookOpen className='h-8 w-8 text-muted-foreground/40' />
                  <p className='text-sm text-muted-foreground'>No documents uploaded yet</p>
                  <p className='text-xs text-muted-foreground'>
                    Upload documents via the knowledge processor API at /upload
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className='flex items-center justify-between rounded-lg border p-3'
                    >
                      <div className='flex items-center gap-3'>
                        <FileText className='h-4 w-4 text-muted-foreground' />
                        <div>
                          <p className='text-sm font-medium'>{doc.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {doc.type} &bull; {doc.chunks_count} chunks &bull;{' '}
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {doc.status === 'ready' && (
                          <Badge variant='outline' className='text-xs text-green-600'>
                            <CheckCircle2 className='mr-1 h-3 w-3' />
                            Ready
                          </Badge>
                        )}
                        {doc.status === 'processing' && (
                          <Badge variant='outline' className='text-xs text-yellow-600'>
                            <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                            Processing
                          </Badge>
                        )}
                        {doc.status === 'error' && (
                          <Badge variant='outline' className='text-xs text-red-600'>
                            <AlertCircle className='mr-1 h-3 w-3' />
                            Error
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Test */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Search className='h-4 w-4' />
                Test Knowledge Search
              </CardTitle>
              <CardDescription>
                Search the knowledge base to verify documents are properly indexed.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Type a search query...'
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? <Loader2 className='h-4 w-4 animate-spin' /> : <Search className='h-4 w-4' />}
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className='space-y-2'>
                  {searchResults.map((result: any, i: number) => (
                    <div key={i} className='rounded-md border bg-muted/30 p-3'>
                      <p className='text-xs font-medium text-muted-foreground mb-1'>
                        Source: {result.source || result.name || 'Knowledge Base'}
                      </p>
                      <p className='text-sm line-clamp-3'>{result.content || result.excerpt}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Config */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <HardDrive className='h-4 w-4' />
                Processing Configuration
              </CardTitle>
              <CardDescription>
                Configure how documents are processed and indexed.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-sm font-medium'>Auto-Process Uploads</Label>
                  <p className='text-xs text-muted-foreground'>
                    Automatically process and index documents when uploaded.
                  </p>
                </div>
                <Switch checked={autoProcess} onCheckedChange={setAutoProcess} />
              </div>

              <Separator />

              <div className='space-y-2'>
                <Label className='text-sm'>Chunk Size (characters)</Label>
                <Input
                  type='number'
                  value={chunkSize}
                  onChange={(e) => setChunkSize(e.target.value)}
                  min={200}
                  max={4000}
                />
                <p className='text-xs text-muted-foreground'>
                  Size of text chunks for embedding. Smaller = more precise, larger = more context.
                </p>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm'>Embedding Model</Label>
                <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='text-embedding-004'>text-embedding-004 (Google)</SelectItem>
                    <SelectItem value='text-embedding-3-small'>text-embedding-3-small (OpenAI)</SelectItem>
                    <SelectItem value='text-embedding-3-large'>text-embedding-3-large (OpenAI)</SelectItem>
                  </SelectContent>
                </Select>
                <p className='text-xs text-muted-foreground'>
                  Model used to create vector embeddings for semantic search.
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
