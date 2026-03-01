'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'

export function DashboardHeader() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentDate = mounted ? formatDate(new Date()) : 'Loading...'

  return (
    <div className="mb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jfif"
            alt="ESKWELABS Logo"
            width={48}
            height={48}
            className="rounded-lg w-10 h-10 sm:w-12 sm:h-12"
            priority
          />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              <span className="tracking-wide">ESKWELABS</span>
              <span className="text-muted-foreground font-normal text-base sm:text-lg md:text-xl ml-2">Analytics</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-0.5">Event Attendance Dashboard</p>
          </div>
        </div>
        <div className="text-xs md:text-sm text-muted-foreground shrink-0">
          <span>Last updated: {currentDate}</span>
        </div>
      </div>
    </div>
  )
}
