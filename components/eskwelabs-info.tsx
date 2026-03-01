'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, GraduationCap, Code, Database, BarChart3 } from 'lucide-react'

export function EskwelabsInfo() {
  const programs = [
    {
      name: 'Data Science Fellowship',
      description: 'Comprehensive 12-week intensive program covering Python, statistics, machine learning, deep learning, and data storytelling. Designed for career changers entering the data science field.',
      icon: <Code className="h-5 w-5" />,
      tags: ['Python', 'Machine Learning', 'Statistics', 'Deep Learning'],
      color: 'bg-blue-500'
    },
    {
      name: 'Data Analytics Bootcamp',
      description: 'Focused program on data analysis fundamentals: SQL, data visualization, business intelligence, and analytical thinking. Perfect for professionals looking to add data skills.',
      icon: <BarChart3 className="h-5 w-5" />,
      tags: ['SQL', 'Tableau', 'Excel', 'Business Intelligence'],
      color: 'bg-green-500'
    },
    {
      name: 'Data Engineering Bootcamp',
      description: 'Technical program covering data pipelines, cloud infrastructure, ETL processes, and the modern data stack. For engineers transitioning to data engineering roles.',
      icon: <Database className="h-5 w-5" />,
      tags: ['ETL', 'Cloud', 'Pipelines', 'Data Warehousing'],
      color: 'bg-purple-500'
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              ESKWELABS Programs
            </CardTitle>
            <CardDescription>
              Philippine-based data science education platform
            </CardDescription>
          </div>
          <a
            href="https://www.eskwelabs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Visit Website
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {programs.map((program, idx) => (
            <div key={idx} className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${program.color} flex items-center justify-center text-white`}>
                {program.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{program.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{program.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {program.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">About ESKWELABS</p>
          <p>ESKWELABS is a leading Philippine data science education platform offering cohort-based bootcamp programs. They provide intensive, industry-relevant training that prepares learners for careers in data science, analytics, and engineering. The cohort model (Cohort 1, 2, 3...) ensures collaborative learning and peer support.</p>
        </div>
      </CardContent>
    </Card>
  )
}
