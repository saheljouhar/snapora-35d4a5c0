import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    const command = new Deno.Command('convert', {
      args: ['heic:-', 'jpeg:-'],
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })

    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(uint8Array)
    await writer.close()

    const { stdout, success } = await process.output()

    if (!success || stdout.length === 0) {
      throw new Error('Conversion failed')
    }

    return new Response(stdout, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/jpeg',
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
