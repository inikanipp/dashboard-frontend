'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Upload, FileSpreadsheet, Loader2, RefreshCw, Filter, X, Database, Table, ChevronDown, ChevronRight, History, User, Clock } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface PreviewRow {
  Retailer: string
  'Invoice Date': string
  State: string
  City: string
  Product: string
  'Price per Unit': number
  'Units Sold': number
  'Total Sales': number
  'Operating Profit': number
  'Operating Margin': number
  'Sales Method': string
}

interface FilterOptions {
  products: string[]
  states: string[]
  cities: string[]
  methods: string[]
}

interface DatabaseStats {
  totalTransactions: number
  totalRetailers: number
  totalProducts: number
  totalCities: number
}

interface UploadLog {
  id_upload: number
  file_name: string
  system_name: string
  status: string
  total_rows: number
  uploaded_by: string
  uploaded_date: string
}

export default function UploadPage() {
  const { data: session, status } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [isLoadingDb, setIsLoadingDb] = useState(true)
  const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  
  const [cleanedData, setCleanedData] = useState<PreviewRow[]>([])
  const [allData, setAllData] = useState<PreviewRow[]>([])

  // Ekstraksi info role & retailer dari session
  const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
  const userRetailerId = (session?.user as any)?.retailerId
  const isStaff = userRole === 'STAFF'

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    products: [],
    states: [],
    cities: [],
    methods: []
  })

  const [selectedFilters, setSelectedFilters] = useState<{
    product: string
    state: string
    city: string
    method: string
  }>({
    product: 'all',
    state: 'all',
    city: 'all',
    method: 'all'
  })

  const [uploadMode, setUploadMode] = useState<'all' | 'filtered'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showUploadLog, setShowUploadLog] = useState(false)

  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    const checkBackend = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.browniesqu.my.id'
      try {
        const res = await fetch(`${backendUrl}/test`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        })
        if (res.ok) {
          setBackendStatus('online')
        } else {
          setBackendStatus('offline')
        }
      } catch (err) {
        console.error('Backend check error:', err)
        setBackendStatus('offline')
      }
    }
    checkBackend()
  }, [])

  // Fungsi Fetch Statistik Database
  const fetchDbStats = async () => {
    setIsLoadingDb(true)
    try {
      const params = new URLSearchParams()
      if (isStaff && userRetailerId) {
        params.append('retailerId', String(userRetailerId))
      }

      const res = await fetch(`/api/v1/analytics-data/all-data?${params.toString()}`)
      const data = await res.json()
      
      if (data.stats) {
        setDbStats({
          totalTransactions: data.stats.transactions || 0,
          totalRetailers: data.stats.retailers || 0,
          totalProducts: data.stats.products || 0,
          totalCities: data.stats.cities || 0
        })
      } else if (data.success && data.data && data.data.length > 0) {
        const retailers = new Set(data.data.map((t: any) => t.retailer_name).filter(Boolean))
        const products = new Set(data.data.map((t: any) => t.product).filter(Boolean))
        const cities = new Set(data.data.map((t: any) => t.city).filter(Boolean))
        setDbStats({
          totalTransactions: data.data.length,
          totalRetailers: retailers.size,
          totalProducts: products.size,
          totalCities: cities.size
        })
      } else {
        setDbStats({ totalTransactions: 0, totalRetailers: 0, totalProducts: 0, totalCities: 0 })
      }
    } catch (err) {
      console.error('Error fetching db stats:', err)
      setDbStats({ totalTransactions: 0, totalRetailers: 0, totalProducts: 0, totalCities: 0 })
    } finally {
      setIsLoadingDb(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDbStats()
    }
  }, [status, userRetailerId, isStaff])

  useEffect(() => {
    if (status !== 'authenticated') return

    const fetchUploadLogs = async () => {
      setIsLoadingLogs(true)
      try {
        const params = new URLSearchParams()
        if (isStaff && userRetailerId) {
          params.append('retailerId', String(userRetailerId))
        }

        const res = await fetch(`/api/upload/history?${params.toString()}`)
        const data = await res.json()
        if (data.success && data.logs) {
          setUploadLogs(data.logs)
        }
      } catch (err) {
        console.error('Error fetching upload logs:', err)
      } finally {
        setIsLoadingLogs(false)
      }
    }
    fetchUploadLogs()
  }, [result, status, userRetailerId, isStaff])

  const applyFilters = (data: PreviewRow[]): PreviewRow[] => {
    return data.filter(row => {
      if (selectedFilters.product !== 'all' && row.Product !== selectedFilters.product) return false
      if (selectedFilters.state !== 'all' && row.State !== selectedFilters.state) return false
      if (selectedFilters.city !== 'all' && row.City !== selectedFilters.city) return false
      if (selectedFilters.method !== 'all' && row['Sales Method'] !== selectedFilters.method) return false
      return true
    })
  }

  const extractFilterOptions = (data: PreviewRow[]) => {
    const options: FilterOptions = {
      products: [...new Set(data.map(r => r.Product).filter(Boolean))].sort(),
      states: [...new Set(data.map(r => r.State).filter(Boolean))].sort(),
      cities: [...new Set(data.map(r => r.City).filter(Boolean))].sort(),
      methods: [...new Set(data.map(r => r['Sales Method']).filter(Boolean))].sort()
    }
    setFilterOptions(options)
  }

  const activeFiltersCount = Object.values(selectedFilters).filter(v => v !== 'all').length

  const clearFilters = () => {
    setSelectedFilters({
      product: 'all',
      state: 'all',
      city: 'all',
      method: 'all'
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      setIsParsing(true)
      setResult(null)
      setCleanedData([])
      setAllData([])
      clearFilters()

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.browniesqu.my.id'

      try {
        const formData = new FormData()
        formData.append('file', selectedFile)

        const previewRes = await fetch(`${backendUrl}/preview`, {
          method: 'POST',
          body: formData 
        })

        if (!previewRes.ok) {
          const errorData = await previewRes.json().catch(() => null)
          const errorMsg = errorData?.detail || await previewRes.text()
          
          let friendlyMessage = errorMsg
          if (errorMsg.includes('list index out of range') || errorMsg.includes('KeyError')) {
            friendlyMessage = "Format kolom Excel tidak sesuai. Pastikan file memiliki kolom: Retailer, Invoice Date, Product, dsb."
          }

          setResult({
            success: false,
            message: friendlyMessage
          })
          
          setFile(null)
          setIsParsing(false)
          return
        }

        const data = await previewRes.json()
        
        if (data.status === 'success') {
          const cleaned = data.preview || []
          setAllData(cleaned)
          setCleanedData(cleaned)
          extractFilterOptions(cleaned)
          
          setResult({
            success: true,
            message: `✓ File dikenali! Preview siap untuk ${cleaned.length} baris data.`
          })
        }
      } catch (error: any) {
        console.error('Preview error:', error)
        
        let friendlyMessage = error.message
        if (error.message.includes('list index out of range') || error.message.includes('KeyError') || error.message.includes('columns')) {
          friendlyMessage = "Format kolom Excel tidak sesuai dengan standar sistem. Pastikan Anda menggunakan file yang memiliki kolom: Retailer, Invoice Date, Product, dsb."
        }

        setResult({
          success: false,
          message: friendlyMessage
        })
        
        setFile(null)
      } finally {
        setIsParsing(false)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  })

  const handleApplyFilters = () => {
    const filtered = applyFilters(allData)
    setCleanedData(filtered)
    setUploadMode('filtered')
    setResult({
      success: true,
      message: `✓ Filter diterapkan! ${filtered.length} baris akan diupload`
    })
  }

  const handleUploadAll = () => {
    setCleanedData(allData)
    setUploadMode('all')
    setResult({
      success: true,
      message: `✓ Mode: Upload semua ${allData.length} baris`
    })
  }

  const handleUpload = async () => {
    if (!file) return
    setIsLoading(true)
    setResult(null)
    setUploadProgress(20)

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.browniesqu.my.id'

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('uploaded_by', session?.user?.name || 'Unknown') 

      if (uploadMode === 'filtered') {
        formData.append('filtered', 'true')
        formData.append('product', selectedFilters.product)
        formData.append('state', selectedFilters.state)
        formData.append('city', selectedFilters.city)
        formData.append('method', selectedFilters.method)
      }

      setUploadProgress(50)
      
      const res = await fetch(`${backendUrl}/upload-transaction`, {
        method: 'POST',
        body: formData
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        const errorMsg = errorData?.detail || await res.text()
        throw new Error(errorMsg)
      }
      
      const data = await res.json()
      
      setUploadProgress(80)

      if (data.status === 'success') {
        await fetch('/api/upload/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_name: file.name,
            system_name: 'Artavista', 
            status: 'success',
            total_rows: data.saved || cleanedData.length,
            uploaded_by: session?.user?.name || 'Unknown',
            note: uploadMode === 'filtered' ? 'Upload Sebagian (Filtered)' : 'Upload Semua'
          })
        }).catch(err => console.error("Gagal menyimpan log history:", err)); 
      }
      
      setUploadProgress(100)
      
      setFile(null)
      setCleanedData([])
      setAllData([])
      setShowFilters(false)
      clearFilters()
      
      fetchDbStats() 
      
      setResult({
        success: data.status === 'success',
        message: data.message || `Berhasil! ${data.saved} baris data transaksi telah ditambahkan ke database.`
      })

    } catch (error: any) {
      console.error('Upload error:', error)
      
      if (file) {
        fetch('/api/upload/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_name: file.name,
            system_name: 'Artavista',
            status: 'failed',
            total_rows: 0,
            uploaded_by: session?.user?.name || 'Unknown',
            note: error.message
          })
        }).catch(() => {});
      }

      setResult({ 
        success: false, 
        message: `Gagal mengupload: ${error.message}` 
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const removeFile = () => {
    setFile(null)
    setCleanedData([])
    setAllData([])
    setResult(null)
    setUploadMode('all')
    clearFilters()
    setFilterOptions({ products: [], states: [], cities: [], methods: [] })
  }

  const [showConfirmUpload, setShowConfirmUpload] = useState(false)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Data Artavista</h1>
        <p className="text-gray-500">Upload file Excel untuk import data penjualan</p>
      </div>

      {/* Database Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" /> Total Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDb ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{dbStats?.totalTransactions?.toLocaleString() || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Table className="w-4 h-4" /> Total Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDb ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{dbStats?.totalRetailers || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDb ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{dbStats?.totalProducts || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Kota</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDb ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-purple-600">{dbStats?.totalCities || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Backend Status */}
      <Card className="mt-4 bg-slate-50">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status API:</span>
              {backendStatus === 'checking' && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Memeriksa koneksi...
                </Badge>
              )}
              {backendStatus === 'online' && (
                <Badge variant="default" className="bg-green-100 text-green-700">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              )}
              {backendStatus === 'offline' && (
                <Badge variant="destructive" className="bg-red-100 text-red-700">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Offline | Periksa server backend Anda
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Message */}
      {result && (
        <div className={`p-4 rounded-lg flex items-start gap-3 shadow-sm border ${
          result.success ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {result.success ? (
            <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          )}
          <p className="text-sm font-medium">{result.message}</p>
        </div>
      )}

      {/* Upload Log */}
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5" />
              Riwayat Upload Data
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowUploadLog(!showUploadLog)}
            >
              {showUploadLog ? 'Sembunyikan' : 'Tampilkan'}
            </Button>
          </div>
        </CardHeader>
        {showUploadLog && (
          <CardContent>
            {isLoadingLogs ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
              </div>
            ) : uploadLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">Belum ada riwayat upload di database.</p>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-3 text-left font-medium text-gray-600">File</th>
                      <th className="p-3 text-left font-medium text-gray-600">System</th>
                      <th className="p-3 text-right font-medium text-gray-600">Rows</th>
                      <th className="p-3 text-left font-medium text-gray-600">Status</th>
                      <th className="p-3 text-left font-medium text-gray-600">Diupload Oleh</th>
                      <th className="p-3 text-left font-medium text-gray-600">Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadLogs.slice(0, 10).map((log, index) => (
                      <tr key={log.id_upload || index} className="border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-medium">{log.file_name}</td>
                        <td className="p-3 text-gray-500">{log.system_name}</td>
                        <td className="p-3 text-right font-semibold">{log.total_rows?.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge className={log.status === 'success' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}>
                            {log.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4 text-gray-400" />
                            {log.uploaded_by}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(log.uploaded_date).toLocaleString('id-ID')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="pt-6">
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragActive ? 'border-[#054CC7] bg-blue-50/50 scale-[0.99]' : 'border-gray-300 hover:border-[#054CC7] hover:bg-slate-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-[#054CC7]" />
              </div>
              <p className="text-lg font-bold text-slate-700">
                {isDragActive ? 'Lepaskan file Excel Anda...' : 'Drag & drop file Excel di sini'}
              </p>
              <p className="text-sm text-gray-500 mt-2">Atau klik area ini untuk mencari file dari komputer</p>
              <Badge variant="outline" className="mt-4 bg-white text-gray-500">Format: .xlsx, .xls</Badge>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileSpreadsheet className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{file.name}</p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={removeFile} className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full h-10 w-10 p-0">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {isParsing && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#054CC7]" />
                  <p className="text-sm font-medium text-slate-600 mt-3">Membaca dan memvalidasi struktur Excel...</p>
                </div>
              )}

              {/* Filter Section */}
              {allData.length > 0 && !isParsing && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 pl-2">
                      <Filter className="h-4 w-4 text-blue-600" />
                      <span className="font-bold text-sm text-slate-700">Penyaringan Data</span>
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 ml-2">
                          {activeFiltersCount} aktif
                        </Badge>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowFilters(!showFilters)}
                      className="text-xs"
                    >
                      {showFilters ? 'Tutup Filter' : 'Buka Filter'} {showFilters ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                    </Button>
                  </div>

                  {showFilters && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Product</label>
                        <Select 
                          value={selectedFilters.product} 
                          onValueChange={(v) => setSelectedFilters({...selectedFilters, product: v})}
                        >
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Semua" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Product</SelectItem>
                            {filterOptions.products.map(p => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">State</label>
                        <Select 
                          value={selectedFilters.state} 
                          onValueChange={(v) => setSelectedFilters({...selectedFilters, state: v})}
                        >
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Semua" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua State</SelectItem>
                            {filterOptions.states.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">City</label>
                        <Select 
                          value={selectedFilters.city} 
                          onValueChange={(v) => setSelectedFilters({...selectedFilters, city: v})}
                        >
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Semua" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua City</SelectItem>
                            {filterOptions.cities.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Method</label>
                        <Select 
                          value={selectedFilters.method} 
                          onValueChange={(v) => setSelectedFilters({...selectedFilters, method: v})}
                        >
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Semua" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Method</SelectItem>
                            {filterOptions.methods.map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {showFilters && (
                    <div className="flex gap-2">
                      <Button onClick={handleApplyFilters} className="flex-1 bg-[#054CC7] hover:bg-blue-800 text-white">
                        <Filter className="h-4 w-4 mr-2" />
                        Terapkan Filter Data
                      </Button>
                      {activeFiltersCount > 0 && (
                        <Button onClick={clearFilters} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                          <X className="h-4 w-4 mr-2" /> Hapus Filter
                        </Button>
                      )}
                      <Button onClick={handleUploadAll} variant="secondary" className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Abaikan Filter (Upload Semua)
                      </Button>
                    </div>
                  )}

                  {/* Upload Mode Indicator */}
                  {uploadMode === 'filtered' && activeFiltersCount > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                      <p className="text-sm text-blue-800 font-medium">
                        Anda akan mengupload data yang telah difilter: <span className="font-bold">{cleanedData.length} baris</span>
                      </p>
                      <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-100" onClick={handleUploadAll}>
                        Batal Filter
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {cleanedData.length > 0 && (
                <>
                  <div className="flex items-center justify-between mt-4">
                    <h3 className="font-bold text-slate-800">Preview Data</h3>
                    
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm custom-scrollbar">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-left font-bold text-slate-600">Retailer</th>
                          <th className="p-3 text-left font-bold text-slate-600">Tanggal</th>
                          <th className="p-3 text-left font-bold text-slate-600">Produk</th>
                          <th className="p-3 text-right font-bold text-slate-600">Unit</th>
                          <th className="p-3 text-right font-bold text-slate-600">Total Sales</th>
                          <th className="p-3 text-left font-bold text-slate-600">Metode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cleanedData.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                            <td className="p-3 font-medium text-slate-800 whitespace-nowrap">{row.Retailer || '-'}</td>
                            <td className="p-3 text-slate-600 whitespace-nowrap">{row['Invoice Date'] || '-'}</td>
                            <td className="p-3 text-slate-600 whitespace-nowrap">{row.Product || '-'}</td>
                            <td className="p-3 text-right font-medium whitespace-nowrap">{row['Units Sold'] || 0}</td>
                            <td className="p-3 text-right font-bold text-green-700 whitespace-nowrap">
                              Rp {row['Total Sales']?.toLocaleString() || 0}
                            </td>
                            <td className="p-3">
                              <Badge variant="secondary" className="bg-slate-100 text-slate-700 whitespace-nowrap">
                                {row['Sales Method'] || '-'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {cleanedData.length > 5 && (
                    <p className="text-xs text-center text-slate-400 font-medium tracking-wide">
                      Menampilkan {cleanedData.length} overview baris data...
                    </p>
                  )}
                </>
              )}

              <div className="pt-4">
                {!showConfirmUpload ? (
                  <Button 
                    onClick={() => setShowConfirmUpload(true)}
                    disabled={isLoading || isParsing || cleanedData.length === 0}
                    className="w-full h-12 bg-[#054CC7] hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg"
                  >
                    <Database className="h-5 w-5 mr-2" />
                    Simpan Data ke Database
                  </Button>
                ) : (
                  <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl space-y-3 animate-in fade-in zoom-in duration-200">
                    <p className="text-center font-bold text-blue-900">
                      Apakah Anda yakin ingin menyimpan baris data ini?
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowConfirmUpload(false)}
                        className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        Batal
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowConfirmUpload(false);
                          handleUpload();
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        Ya, Simpan Sekarang
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#054CC7] to-[#17C3CC] h-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}