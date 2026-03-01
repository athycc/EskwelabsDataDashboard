'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CheckCircle, AlertCircle, X, FileUp, Download, ShieldAlert, FileCheck } from 'lucide-react'
import { toast } from 'sonner'
import { getStoredUploads, saveUpload, getStoredDeletions } from '@/lib/utils'

interface UploadResult {
  success: boolean
  message: string
  summary?: {
    eventsAdded: number
    attendeesAdded: number
    registrationsAdded: number
  }
  processed?: {
    totalRows: number
    eventsInCSV: number
    eventsExisting: number
    attendeesExisting: number
    registrationsExisting: number
  }
  skipped?: string[]
  errors?: string[]
  error?: string
  detectedHeaders?: string[]
  duplicateEvents?: string[]
}

interface ValidationResult {
  valid: boolean
  totalRows: number
  eventsInCSV: number
  duplicateEvents: string[]
  newEvents: string[]
  detectedHeaders: string[]
  allDuplicate: boolean
}

export function CSVUpload({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = async (file: File): Promise<ValidationResult | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('validateOnly', 'true')
      // Include stored uploads so cold Vercel instances have full data for accurate validation
      const stored = getStoredUploads()
      if (stored.length > 0) formData.append('storedUploads', JSON.stringify(stored))
      const deletions = getStoredDeletions()
      if (deletions.length > 0) formData.append('storedDeletions', JSON.stringify(deletions))
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        body: formData
      })
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch {
      return null
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    // Block upload if validation showed all duplicates
    if (validation?.allDuplicate) {
      setResult({
        success: false,
        message: `Upload blocked: All events in this file already exist in the dashboard (${validation.duplicateEvents.join(', ')}). Please upload a CSV with new event data.`,
        duplicateEvents: validation.duplicateEvents
      })
      return
    }

    setIsUploading(true)
    setResult(null)

    try {
      // Read CSV text on the client BEFORE sending, so we can persist it to localStorage
      const csvText = await selectedFile.text()

      const formData = new FormData()
      formData.append('file', selectedFile)
      // Include stored uploads so cold Vercel instances have full data
      const stored = getStoredUploads()
      if (stored.length > 0) formData.append('storedUploads', JSON.stringify(stored))
      const deletions = getStoredDeletions()
      if (deletions.length > 0) formData.append('storedDeletions', JSON.stringify(deletions))

      const response = await fetch('/api/dashboard', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        // Persist the uploaded CSV to localStorage so future requests can rehydrate cold instances
        saveUpload(csvText)
        setSelectedFile(null)
        setValidation(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        // Notify all components to refresh immediately
        window.dispatchEvent(new Event('dashboard-data-changed'))
        onUploadComplete?.()
        // Staggered retries to handle serverless cold starts / instance mismatch
        setTimeout(() => window.dispatchEvent(new Event('dashboard-data-changed')), 1000)
        setTimeout(() => window.dispatchEvent(new Event('dashboard-data-changed')), 3000)
        toast.success(`Upload successful! ${data.summary?.eventsAdded || 0} events added.`)
      } else {
        setResult({ 
          success: false, 
          message: data.error || 'Upload failed', 
          detectedHeaders: data.detectedHeaders,
          duplicateEvents: data.duplicateEvents 
        })
        toast.error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setResult({ success: false, message: 'Failed to upload file. Please try again.' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setResult({ success: false, message: 'Please select a CSV file.' })
        return
      }
      setSelectedFile(file)
      setResult(null)
      setValidation(null)

      // Pre-validate to check for duplicates
      setIsValidating(true)
      const v = await validateFile(file)
      setIsValidating(false)
      if (v) {
        setValidation(v)
      }
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setResult(null)
    setValidation(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const downloadTemplate = () => {
    const template = 'event_name,event_type,event_date,location,capacity,attendee_name,attendee_email,cohort,attended\nNew Workshop,workshop,2025-01-15,Manila,50,Juan Santos,juan@example.com,Cohort 1,true\nNew Workshop,workshop,2025-01-15,Manila,50,Maria Garcia,maria@example.com,Cohort 2,false'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'attendance-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadSample = () => {
    const a = document.createElement('a')
    a.href = '/sample-new-event.csv'
    a.download = 'sample-new-event.csv'
    a.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
          Upload Attendance Data
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Upload a CSV file to add new event attendance records to the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File selection area */}
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
          />

          {!selectedFile ? (
            <Button
              variant="outline"
              className="w-full h-20 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-1">
                <FileUp className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">Choose CSV File</span>
                <span className="text-xs text-muted-foreground">Click to browse your files</span>
              </div>
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Validation status */}
              {isValidating && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800 text-xs">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  Checking file for duplicates...
                </div>
              )}

              {validation && !isValidating && (
                <div className={`flex items-start gap-2 p-2 rounded-lg text-xs border ${
                  validation.allDuplicate
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
                    : validation.duplicateEvents.length > 0
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800'
                }`}>
                  {validation.allDuplicate ? (
                    <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  ) : validation.duplicateEvents.length > 0 ? (
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <FileCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    {validation.allDuplicate ? (
                      <>
                        <p className="font-medium">Duplicate file detected - upload blocked</p>
                        <p className="mt-0.5">All {validation.duplicateEvents.length} event(s) already exist: {validation.duplicateEvents.join(', ')}</p>
                        <p className="mt-0.5">Please upload a CSV with new event data.</p>
                      </>
                    ) : validation.duplicateEvents.length > 0 ? (
                      <>
                        <p className="font-medium">Partial duplicates found</p>
                        <p className="mt-0.5">New events: {validation.newEvents.join(', ')}</p>
                        <p className="mt-0.5">Already existing: {validation.duplicateEvents.join(', ')}</p>
                        <p className="mt-0.5">New data will be added, existing events will be skipped.</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">File looks good!</p>
                        <p className="mt-0.5">{validation.totalRows} rows with {validation.newEvents.length} new event(s): {validation.newEvents.join(', ')}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || isValidating || (validation?.allDuplicate ?? false)}
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Uploading...
                </>
              ) : validation?.allDuplicate ? (
                <>
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Duplicate - Cannot Upload
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload &amp; Analyze
                </>
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={downloadSample} title="Download sample CSV with new event">
              <FileText className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={downloadTemplate} title="Download blank CSV template">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expected format hint */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
          <p className="font-medium mb-1">Expected CSV columns:</p>
          <p>event_name, event_type, event_date, location, capacity, attendee_name, attendee_email, cohort, attended</p>
          <p className="mt-1">Flexible headers accepted (e.g., &quot;name&quot; for event_name, &quot;email&quot; for attendee_email, &quot;date&quot; for event_date)</p>
        </div>

        {/* Upload result */}
        {result && (
          <div className={`p-4 rounded-lg text-sm border ${
            result.success
              ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">{result.message}</p>

                {result.success && result.summary && (
                  <div className="mt-3 space-y-2">
                    {/* New items added */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded bg-white/50 dark:bg-black/20">
                        <p className="text-lg font-bold">{result.summary.eventsAdded}</p>
                        <p className="text-xs">Events Added</p>
                      </div>
                      <div className="text-center p-2 rounded bg-white/50 dark:bg-black/20">
                        <p className="text-lg font-bold">{result.summary.attendeesAdded}</p>
                        <p className="text-xs">Attendees Added</p>
                      </div>
                      <div className="text-center p-2 rounded bg-white/50 dark:bg-black/20">
                        <p className="text-lg font-bold">{result.summary.registrationsAdded}</p>
                        <p className="text-xs">Registrations Added</p>
                      </div>
                    </div>

                    {/* Processing summary */}
                    {result.processed && (
                      <div className="text-xs p-2 rounded bg-white/50 dark:bg-black/20">
                        <p className="font-medium mb-1">Processing summary:</p>
                        <p>Rows processed: {result.processed.totalRows} | Unique events in CSV: {result.processed.eventsInCSV}</p>
                        {(result.processed.eventsExisting > 0 || result.processed.attendeesExisting > 0 || result.processed.registrationsExisting > 0) && (
                          <p className="mt-0.5">Already existing: {result.processed.eventsExisting} events, {result.processed.attendeesExisting} attendees, {result.processed.registrationsExisting} registrations</p>
                        )}
                      </div>
                    )}

                    {(result.summary.eventsAdded + result.summary.attendeesAdded + result.summary.registrationsAdded) > 0 ? (
                      <p className="text-xs mt-2">Data has been added to the event list. Check the Data Viewer below to see your uploaded data.</p>
                    ) : (
                      <p className="text-xs mt-2">No new data was added. To add new records, make sure your CSV contains event names, attendee emails, or attendee names that do not already exist in the dashboard.</p>
                    )}
                  </div>
                )}

                {result.detectedHeaders && result.detectedHeaders.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium">Detected headers in your file:</p>
                    <p className="text-xs font-mono bg-white/50 dark:bg-black/20 p-1 rounded mt-1">{result.detectedHeaders.join(', ')}</p>
                  </div>
                )}

                {result.skipped && result.skipped.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium">Skipped (duplicates) ({result.skipped.length}):</p>
                    <ul className="list-disc list-inside text-xs mt-1 space-y-0.5 max-h-24 overflow-y-auto">
                      {result.skipped.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium">Warnings ({result.errors.length}):</p>
                    <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                      {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
