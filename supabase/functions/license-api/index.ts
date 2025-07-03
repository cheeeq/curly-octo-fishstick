import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface ClientRequest {
  licensekey: string
  product: string
  version: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/license-api', '')

    // Test endpoint - no auth required
        JSON.stringify({ 
          status: 'ok',
          message: 'License API is working',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          endpoints: {
            test: 'GET /test - API status check',
            client: 'POST /client - License validation'
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Client endpoint - requires authorization
    if (path === '/client' && req.method === 'POST') {
      return await handleClientAuth(req)
    }

    return new Response(
      JSON.stringify({ 
        status_code: 404,
        status_id: null,
        status_overview: 'error',
        status_msg: 'Endpoint not found. Available endpoints: /test (GET), /client (POST)' 
      }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ 
        status_code: 500,
        status_id: null,
        status_overview: 'error',
        status_msg: 'Internal server error',
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleClientAuth(req: Request) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          status_code: 401,
          status_id: null,
          status_overview: 'error',
          status_msg: 'Missing authorization header' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract API key from authorization header
    let apiKey = authHeader
    
    // Handle Bearer token format
    if (authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7)
    }
    
    // For demo purposes, accept any non-empty API key
    if (!apiKey || apiKey.trim() === '') {
      return new Response(
        JSON.stringify({ 
          status_code: 401,
          status_id: null,
          status_overview: 'error',
          status_msg: 'Invalid API key' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const body: ClientRequest = await req.json()
    const { licensekey, product, version } = body

    if (!licensekey || !product || !version) {
      return new Response(
        JSON.stringify({ 
          status_code: 400,
          status_id: null,
          status_overview: 'error',
          status_msg: 'License key, product and version are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Demo lisans kontrolü - gerçek veritabanı sorgusu yerine demo data
    if (licensekey === 'DEMO-12345-ABCDE-67890' && product === 'Demo Product') {
      // Demo için hash oluştur
      const licenseFirst = licensekey.substr(0, 2)
      const licenseLast = licensekey.substr(licensekey.length - 2)
      const publicApiKeyFirst = apiKey.substr(0, 2)
      
      const hashContent = `${licenseFirst}${licenseLast}${publicApiKeyFirst}`
      const encodedHash = btoa(hashContent)
      
      // Zaman damgası
      const epochTime = Math.floor(Date.now() / 1000)
      const epochTimeShort = epochTime.toString().substr(0, epochTime.toString().length - 2)
      
      const statusId = `${encodedHash}694201337${epochTimeShort}`

      return new Response(
        JSON.stringify({
          status_code: 200,
          status_id: statusId,
          status_overview: 'success',
          status_msg: 'Authentication successful (Demo)',
          license_info: {
            product: 'Demo Product',
            version: '1.0.0',
            expires_at: '2025-12-31T23:59:59Z',
            max_activations: 1,
            current_activations: 0,
            license_type: 'demo',
            api_key_used: apiKey.substring(0, 5) + '...'
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Diğer lisanslar için genel başarısız yanıt
    return new Response(
      JSON.stringify({ 
        status_code: 404,
        status_id: null,
        status_overview: 'error',
        status_msg: 'License not found or invalid' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Client auth error:', error)
    return new Response(
      JSON.stringify({ 
        status_code: 500,
        status_id: null,
        status_overview: 'error',
        status_msg: 'Authentication failed',
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('x-real-ip') || 
         'unknown'
}