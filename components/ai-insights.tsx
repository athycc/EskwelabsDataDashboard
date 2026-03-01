'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles } from 'lucide-react'

export function AIInsights() {
  const [insights, setInsights] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const fetchInsights = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/dashboard/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'overview' })
      })
      if (!response.ok) throw new Error('Failed to fetch insights')
      const data = await response.json()
      setInsights(data.insights || '')
    } catch (err) {
      console.error('Error fetching AI insights:', err)
      setError('Failed to generate insights. Using default analysis.')
      setInsights('Key Insights:\n- Dashboard is tracking attendance across multiple event types.\n- Mixed attendance patterns suggest need for improved engagement strategies.\n\nRecommendations:\n- Analyze low-attendance events for improvement opportunities.\n- Implement reminder systems for registered attendees.\n\nIssues to Monitor:\n- No-shows remain a concern in several events.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Intelligent analysis of your event attendance data
          </CardDescription>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchInsights}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Analyzing...' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && !insights ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                {error}
              </div>
            )}
            <div className="prose prose-sm max-w-none dark:prose-invert text-sm text-foreground whitespace-pre-wrap">
              {insights}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
