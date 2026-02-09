
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Activity, CheckCircle, XCircle, AlertTriangle, RefreshCw, Key, Server, Cpu } from 'lucide-react'

export default function AIDiagnosticsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const res = await fetch('/api/ai/test')
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to connect to diagnostics endpoint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">AI System Diagnostics</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Verify internal systems, API keys, and model connectivity.</p>
        </div>
        <Button onClick={runDiagnostics} disabled={loading} size="default" className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
          {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
          Run Complete Check
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Diagnostics Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Overview */}
          <Card className={`border-t-4 ${result.success ? 'border-t-green-500' : 'border-t-red-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                System Status
                {result.success ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Operational</Badge>
                ) : (
                  <Badge variant="destructive">Critical Failure</Badge>
                )}
              </CardTitle>
              <CardDescription>{result.message}</CardDescription>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="flex flex-col items-center justify-center p-6 text-green-600 space-y-2">
                  <CheckCircle className="w-16 h-16" />
                  <p className="font-medium">All Systems Go</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-red-600 space-y-2">
                  <XCircle className="w-16 h-16" />
                  <p className="font-medium">Attention Required</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Environment Variable Check */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Environment Variable</p>
                    <p className="text-xs text-gray-500">Checking GOOGLE_AI_API_KEY...</p>
                  </div>
                </div>
                {result.debugInfo?.checks?.envVarPresent ? (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" /> Found
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 text-sm font-medium">
                    <XCircle className="w-4 h-4 mr-1" /> Missing
                  </div>
                )}
              </div>

              {/* API Key Format Check */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Key Format</p>
                    <p className="text-xs text-gray-500">
                      {result.debugInfo?.checks?.apiKeyStart ? `Prefix: ${result.debugInfo.checks.apiKeyStart}` : 'No key to check'}
                    </p>
                  </div>
                </div>
                {result.debugInfo?.checks?.apiKeyStart ? (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" /> Valid
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400 text-sm">
                    Unknown
                  </div>
                )}
              </div>

              {/* Connectivity Check */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Gemini API Connectivity</p>
                    <p className="text-xs text-gray-500">Attempting to generate token...</p>
                  </div>
                </div>
                {result.debugInfo?.checks?.connectivity ? (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" /> Connected
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 text-sm font-medium">
                    <XCircle className="w-4 h-4 mr-1" /> Failed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {result?.debugInfo?.error && (
         <div className="p-4 bg-gray-900 text-gray-100 rounded-lg font-mono text-xs overflow-x-auto">
           <p className="font-bold mb-2">Error Log:</p>
           {result.debugInfo.error}
         </div>
      )}
    </div>
  )
}
