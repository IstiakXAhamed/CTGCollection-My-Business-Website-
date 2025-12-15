'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Upload, FileSpreadsheet, Check, X, AlertCircle, 
  Download, Loader2, CheckCircle 
} from 'lucide-react'

interface ImportRow {
  name: string
  description: string
  category: string
  basePrice: number
  salePrice?: number
  size?: string
  color?: string
  stock: number
  images?: string
  status?: 'pending' | 'success' | 'error'
  error?: string
}

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    parseCSV(selectedFile)
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const rows: ImportRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const row: any = { status: 'pending' }
        
        headers.forEach((header, idx) => {
          if (header === 'baseprice' || header === 'saleprice' || header === 'stock') {
            row[header === 'baseprice' ? 'basePrice' : header === 'saleprice' ? 'salePrice' : 'stock'] = parseFloat(values[idx]) || 0
          } else {
            row[header] = values[idx]
          }
        })

        if (row.name && row.basePrice) {
          rows.push(row)
        }
      }

      setPreview(rows)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (preview.length === 0) return

    setImporting(true)
    let successCount = 0
    let failedCount = 0

    const updatedPreview = [...preview]

    for (let i = 0; i < updatedPreview.length; i++) {
      const row = updatedPreview[i]
      
      try {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: row.name,
            description: row.description || `${row.name} - Quality product`,
            categorySlug: row.category?.toLowerCase().replace(/\s+/g, '-'),
            basePrice: row.basePrice,
            salePrice: row.salePrice || null,
            images: row.images ? row.images.split('|') : [],
            variants: [{
              size: row.size || null,
              color: row.color || null,
              stock: row.stock || 0,
              sku: `SKU-${Date.now()}-${i}`
            }]
          })
        })

        if (res.ok) {
          updatedPreview[i].status = 'success'
          successCount++
        } else {
          const data = await res.json()
          updatedPreview[i].status = 'error'
          updatedPreview[i].error = data.error || 'Failed to import'
          failedCount++
        }
      } catch (error: any) {
        updatedPreview[i].status = 'error'
        updatedPreview[i].error = error.message
        failedCount++
      }

      setPreview([...updatedPreview])
    }

    setResults({ success: successCount, failed: failedCount })
    setImporting(false)
  }

  const downloadSampleCSV = () => {
    const sample = `name,description,category,basePrice,salePrice,size,color,stock,images
Premium T-Shirt,Comfortable cotton t-shirt,Clothing,999,799,M,Black,50,https://example.com/img1.jpg|https://example.com/img2.jpg
Wireless Earbuds,High quality audio,Electronics,2499,1999,,White,100,https://example.com/earbuds.jpg
Leather Wallet,Genuine leather wallet,Accessories,599,,One Size,Brown,75,`

    const blob = new Blob([sample], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-products.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">📤 Bulk Product Import</h1>
        <p className="text-muted-foreground">Import multiple products at once using CSV file</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Upload CSV File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 transition"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {file ? file.name : 'Click to upload or drag & drop'}
              </p>
              <p className="text-sm text-muted-foreground">
                CSV files only. Max 1000 products per import.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button variant="outline" onClick={downloadSampleCSV}>
              <Download className="w-4 h-4 mr-2" />
              Download Sample CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview & Import */}
      {preview.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Preview ({preview.length} products)</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setPreview([])
                  setResults(null)
                }}
              >
                Clear
              </Button>
              <Button
                onClick={handleImport}
                disabled={importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import All
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {results && (
              <div className={`p-4 rounded-lg mb-4 ${
                results.failed === 0 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
              }`}>
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Import complete: {results.success} success, {results.failed} failed
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Base Price</th>
                    <th className="px-4 py-3 text-right">Sale Price</th>
                    <th className="px-4 py-3 text-center">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 20).map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3">
                        {row.status === 'pending' && <span className="text-gray-400">⏳</span>}
                        {row.status === 'success' && <Check className="w-5 h-5 text-green-600" />}
                        {row.status === 'error' && (
                          <span title={row.error}>
                            <X className="w-5 h-5 text-red-600" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">{row.category}</td>
                      <td className="px-4 py-3 text-right">৳{row.basePrice}</td>
                      <td className="px-4 py-3 text-right">
                        {row.salePrice ? `৳${row.salePrice}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">{row.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 20 && (
                <p className="text-center text-muted-foreground py-4">
                  Showing 20 of {preview.length} products
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSV Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            CSV Format Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Your CSV file should have the following columns:</p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              name, description, category, basePrice, salePrice, size, color, stock, images
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Required Fields:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>name</strong> - Product name</li>
                  <li><strong>basePrice</strong> - Original price (number)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Optional Fields:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>description</strong> - Product description</li>
                  <li><strong>category</strong> - Category name</li>
                  <li><strong>salePrice</strong> - Discounted price</li>
                  <li><strong>size, color</strong> - Variant info</li>
                  <li><strong>stock</strong> - Quantity available</li>
                  <li><strong>images</strong> - URLs separated by |</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
