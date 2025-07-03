import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Code, 
  Copy, 
  CheckCircle, 
  Play, 
  Key, 
  Shield,
  Globe,
  Terminal,
  Book,
  ExternalLink,
  Database,
  Settings
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { licenseApiService } from '../services/api'
import toast from 'react-hot-toast'

const ApiDocs = () => {
  const [copiedCode, setCopiedCode] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    toast.success('Kod kopyalandı!')
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const testApi = async () => {
    setTesting(true)
    try {
      const data = await licenseApiService.testApi()
      setTestResult({ 
        success: true, 
        message: 'API test başarılı!',
        data: data
      })
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: 'API test başarısız',
        error: error.message
      })
    } finally {
      setTesting(false)
    }
  }

  const testClientApi = async () => {
    setTesting(true)
    try {
      const data = await licenseApiService.testClientApi()
      setTestResult({ 
        success: data.status_overview === 'success', 
        message: data.status_overview === 'success' ? 'Client API test başarılı!' : 'Client API test başarısız',
        data: data
      })
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: 'Client API bağlantı hatası',
        error: error.message
      })
    } finally {
      setTesting(false)
    }
  }

  const nodeJsExample = `const axios = require('axios');

const startup = async () => {
  // API bilgileriniz
  const url = 'http://localhost:3001/api/license-api/client';
  const licensekey = 'DEMO-12345-ABCDE-67890'; // Demo lisans anahtarı
  const product = 'Demo Product'; // Demo ürün adı
  const version = '1.0.0'; // Demo versiyon
  const public_api_key = 'demo-api-key-12345'; // Demo API anahtarı

  try {
    // Lisans sunucusuna istek gönder
    const res = await axios.post(
      url,
      {
        licensekey,
        product,
        version,
      },
      {
        headers: { 
          'Authorization': public_api_key, // Bearer prefix isteğe bağlı
          'Content-Type': 'application/json'
        },
      }
    );

    // İstek gövdesini doğrula
    if (!res.data.status_code || !res.data.status_id) {
      console.log('Geçersiz kimlik doğrulama');
      return process.exit(1);
    }

    // Kimlik doğrulamayı kontrol et
    if (res.data.status_overview !== 'success') {
      console.log('Kimlik doğrulama başarısız');
      console.log(res.data.status_msg);
      return process.exit(1);
    }

    const hash = res.data.status_id;

    // Hash'i böl
    const hash_split = hash.split('694201337');

    // ---> Metin tabanlı doğrulama <---

    // hash_split[0]'ı Base64 decode et
    const decoded_hash = Buffer.from(hash_split[0], 'base64').toString();

    // Lisans anahtarının ilk 2 karakteri
    const license_first = licensekey.substr(0, 2);

    // Lisans anahtarının son 2 karakteri
    const license_last = licensekey.substr(licensekey.length - 2);

    // Public API key'in ilk 2 karakteri
    const public_api_key_first = public_api_key.substr(0, 2);

    if (
      decoded_hash !==
      \`\${license_first}\${license_last}\${public_api_key_first}\`
    ) {
      console.log('Kimlik doğrulama başarısız');
      return process.exit(1);
    }

    // ---> Zaman tabanlı doğrulama <---

    // Epoch zamanını al
    let epoch_time_full = Math.floor(Date.now() / 1000);

    // Epoch zamanının son 2 karakterini kaldır
    const epoch_time = epoch_time_full
      .toString()
      .substr(0, epoch_time_full.toString().length - 2);

    if (parseInt(epoch_time) - parseInt(hash_split[1]) > 1) {
      console.log('Kimlik doğrulama başarısız');
      return process.exit(1);
    }

    console.log('Başarılı kimlik doğrulama');
    console.log('Lisans bilgileri:', res.data.license_info);
  } catch (err) {
    console.log('Kimlik doğrulama başarısız');
    console.log(err.response?.data || err.message);
    process.exit(1);
  }
};

// Startup fonksiyonunu çağır
startup();`

  const curlExample = `# Test endpoint (authorization gerektirmez)
curl -X GET "http://localhost:3001/api/license-api/test"

# Client endpoint (demo verilerle)
curl -X POST "http://localhost:3001/api/license-api/client" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: demo-api-key-12345" \\
  -d '{
    "licensekey": "DEMO-12345-ABCDE-67890",
    "product": "Demo Product",
    "version": "1.0.0"
  }'`

  const responseExample = `{
  "status_code": 200,
  "status_id": "REVNTzY5NDIwMTMzNzE3MzU5NzU=",
  "status_overview": "success",
  "status_msg": "Authentication successful (Demo)",
  "license_info": {
    "product": "Demo Product",
    "version": "1.0.0",
    "expires_at": "2025-12-31T23:59:59Z",
    "max_activations": 1,
    "current_activations": 0,
    "license_type": "demo",
    "api_key_used": "demo-..."
  }
}`

  const errorResponseExample = `{
  "status_code": 404,
  "status_id": null,
  "status_overview": "error",
  "status_msg": "License not found or invalid"
}`

  const testResponseExample = `{
  "status": "ok",
  "message": "License API is working",
  "timestamp": "2025-01-02T19:26:36.789Z",
  "version": "2.0.0",
  "endpoints": {
    "test": "GET /test - API status check",
    "client": "POST /client - License validation"
  }
}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">API Dokümantasyonu</h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            GateWay License API'sini kullanarak yazılımlarınızı koruyun
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={testApi} loading={testing}>
            <Play className="w-4 h-4 mr-2" />
            API Test Et
          </Button>
          <Button onClick={testClientApi} loading={testing} variant="secondary">
            <Shield className="w-4 h-4 mr-2" />
            Client Test
          </Button>
        </div>
      </motion.div>

      {/* API URL Bilgisi */}
      <Card className="border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-700 dark:text-primary-400">
            <Globe className="w-5 h-5" />
            API Endpoint Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                Base URL (Local Development)
              </h4>
              <div className="bg-secondary-100 dark:bg-secondary-800 p-3 rounded-lg font-mono text-sm">
                http://localhost:3001/api/license-api
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                  Test Endpoint
                </h4>
                <div className="bg-success-100 dark:bg-success-900/20 p-3 rounded-lg">
                  <code className="text-sm text-success-700 dark:text-success-400">
                    GET /test
                  </code>
                  <p className="text-xs text-success-600 dark:text-success-400 mt-1">
                    API durumunu kontrol eder (Auth gerektirmez)
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                  Client Endpoint
                </h4>
                <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-lg">
                  <code className="text-sm text-primary-700 dark:text-primary-400">
                    POST /client
                  </code>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                    Lisans doğrulama işlemi (Auth gerektirir)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Result */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-success-50 border-success-200 text-success-800 dark:bg-success-900/20 dark:border-success-800 dark:text-success-400'
              : 'bg-error-50 border-error-200 text-error-800 dark:bg-error-900/20 dark:border-error-800 dark:text-error-400'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Key className="w-5 h-5" />
            )}
            <span className="font-medium">{testResult.message}</span>
          </div>
          {testResult.data && (
            <pre className="text-xs bg-black/10 dark:bg-white/10 p-2 rounded mt-2 overflow-x-auto">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          )}
          {testResult.error && (
            <pre className="text-xs bg-black/10 dark:bg-white/10 p-2 rounded mt-2 overflow-x-auto">
              {testResult.error}
            </pre>
          )}
        </motion.div>
      )}

      {/* Demo Test Verileri */}
      <Card className="border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning-700 dark:text-warning-400">
            <Database className="w-5 h-5" />
            Demo Test Verileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                Demo Lisans Bilgileri
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">License Key:</span>
                  <code className="bg-secondary-200 dark:bg-secondary-700 px-1 rounded">DEMO-12345-ABCDE-67890</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Product:</span>
                  <code className="bg-secondary-200 dark:bg-secondary-700 px-1 rounded">Demo Product</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Version:</span>
                  <code className="bg-secondary-200 dark:bg-secondary-700 px-1 rounded">1.0.0</code>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                API Anahtarı
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">API Key:</span>
                  <code className="bg-secondary-200 dark:bg-secondary-700 px-1 rounded">Herhangi bir değer</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Örnek:</span>
                  <code className="bg-secondary-200 dark:bg-secondary-700 px-1 rounded">demo-api-key-12345</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Format:</span>
                  <code className="bg-secondary-200 dark:bg-secondary-700 px-1 rounded">Bearer token isteğe bağlı</code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            API Genel Bakış
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                Kimlik Doğrulama
              </h3>
              <ul className="text-secondary-600 dark:text-secondary-400 text-sm space-y-1">
                <li>• <strong>/test</strong> endpoint'i authorization gerektirmez</li>
                <li>• <strong>/client</strong> endpoint'i Authorization header\'ında API anahtarı gerektirir</li>
                <li>• Bearer token formatı desteklenir ama zorunlu değildir</li>
                <li>• Demo için herhangi bir API anahtarı kabul edilir</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                Güvenlik Özellikleri
              </h3>
              <ul className="text-secondary-600 dark:text-secondary-400 text-sm space-y-1">
                <li>• Hash tabanlı doğrulama sistemi</li>
                <li>• Zaman damgası kontrolü (1 saniye tolerans)</li>
                <li>• Lisans durumu ve süre kontrolü</li>
                <li>• Ürün eşleştirme doğrulaması</li>
                <li>• CORS koruması</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request/Response Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Endpoint Yanıtı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-secondary-100 dark:bg-secondary-800 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{testResponseExample}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(testResponseExample, 'test-response')}
                className="absolute top-2 right-2 p-2 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
              >
                {copiedCode === 'test-response' ? (
                  <CheckCircle className="w-4 h-4 text-success-500" />
                ) : (
                  <Copy className="w-4 h-4 text-secondary-500" />
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Başarılı Client Yanıtı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-secondary-100 dark:bg-secondary-800 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{responseExample}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(responseExample, 'response')}
                className="absolute top-2 right-2 p-2 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
              >
                {copiedCode === 'response' ? (
                  <CheckCircle className="w-4 h-4 text-success-500" />
                ) : (
                  <Copy className="w-4 h-4 text-secondary-500" />
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hata Yanıtı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-secondary-100 dark:bg-secondary-800 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{errorResponseExample}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(errorResponseExample, 'error')}
                className="absolute top-2 right-2 p-2 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
              >
                {copiedCode === 'error' ? (
                  <CheckCircle className="w-4 h-4 text-success-500" />
                ) : (
                  <Copy className="w-4 h-4 text-secondary-500" />
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>cURL Örnekleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-secondary-100 dark:bg-secondary-800 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{curlExample}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(curlExample, 'curl')}
                className="absolute top-2 right-2 p-2 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
              >
                {copiedCode === 'curl' ? (
                  <CheckCircle className="w-4 h-4 text-success-500" />
                ) : (
                  <Copy className="w-4 h-4 text-secondary-500" />
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Node.js Entegrasyon Örneği
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-secondary-100 dark:bg-secondary-800 p-4 rounded-lg text-sm overflow-x-auto max-h-96">
              <code>{nodeJsExample}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(nodeJsExample, 'nodejs')}
              className="absolute top-2 right-2 p-2 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
            >
              {copiedCode === 'nodejs' ? (
                <CheckCircle className="w-4 h-4 text-success-500" />
              ) : (
                <Copy className="w-4 h-4 text-secondary-500" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Error Codes */}
      <Card>
        <CardHeader>
          <CardTitle>HTTP Durum Kodları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200 dark:border-secondary-700">
                  <th className="text-left p-3 font-medium text-secondary-700 dark:text-secondary-300">
                    Kod
                  </th>
                  <th className="text-left p-3 font-medium text-secondary-700 dark:text-secondary-300">
                    Açıklama
                  </th>
                  <th className="text-left p-3 font-medium text-secondary-700 dark:text-secondary-300">
                    Çözüm
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-secondary-200 dark:border-secondary-700">
                  <td className="p-3 font-mono text-sm">200</td>
                  <td className="p-3">Başarılı işlem</td>
                  <td className="p-3 text-sm text-secondary-600 dark:text-secondary-400">
                    İstek başarıyla tamamlandı
                  </td>
                </tr>
                <tr className="border-b border-secondary-200 dark:border-secondary-700">
                  <td className="p-3 font-mono text-sm">400</td>
                  <td className="p-3">Eksik parametreler</td>
                  <td className="p-3 text-sm text-secondary-600 dark:text-secondary-400">
                    licensekey, product ve version parametrelerini kontrol edin
                  </td>
                </tr>
                <tr className="border-b border-secondary-200 dark:border-secondary-700">
                  <td className="p-3 font-mono text-sm">401</td>
                  <td className="p-3">Geçersiz/eksik API anahtarı</td>
                  <td className="p-3 text-sm text-secondary-600 dark:text-secondary-400">
                    Authorization header'ında geçerli API anahtarını gönderin
                  </td>
                </tr>
                <tr className="border-b border-secondary-200 dark:border-secondary-700">
                  <td className="p-3 font-mono text-sm">404</td>
                  <td className="p-3">Lisans/endpoint bulunamadı</td>
                  <td className="p-3 text-sm text-secondary-600 dark:text-secondary-400">
                    Lisans anahtarının ve endpoint'in doğru olduğundan emin olun
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-sm">500</td>
                  <td className="p-3">Sunucu hatası</td>
                  <td className="p-3 text-sm text-secondary-600 dark:text-secondary-400">
                    Tekrar deneyin, sorun devam ederse destek ile iletişime geçin
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ApiDocs