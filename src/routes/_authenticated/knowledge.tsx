import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/knowledge')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/knowledge"!</div>
}
