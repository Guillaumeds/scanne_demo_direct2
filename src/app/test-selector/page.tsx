import TestForm from '@/components/test/TestForm'

export default function TestSelectorPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Product Selector Test</h1>
          <p className="text-muted-foreground">
            Testing ShadCN UI modal with proper scrolling behavior
          </p>
        </div>
        
        <TestForm />
      </div>
    </div>
  )
}
