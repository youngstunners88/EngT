import { type NextRequest, NextResponse } from "next/server"

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"

// Models to try in order. If the primary model is unavailable for the account,
// we fall back to the next one before giving up.
const MODELS = ["eleven_multilingual_v2", "eleven_turbo_v2_5", "eleven_monolingual_v1"]

async function requestSpeech(apiKey: string, voiceId: string, text: string, modelId: string) {
  // output_format is passed as a query param per the current ElevenLabs API.
  const url = `${ELEVENLABS_API_URL}/${voiceId}?output_format=mp3_44100_128`

  return fetch(url, {
    method: "POST",
    headers: {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  })
}

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId = "EXAVITQu4vr4xnSDxMaL" } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 })
    }

    let lastErrorDetail = ""

    for (const modelId of MODELS) {
      try {
        const response = await requestSpeech(apiKey, voiceId, text, modelId)

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer()
          return new NextResponse(audioBuffer, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
            },
          })
        }

        // HTTP error from ElevenLabs (e.g. invalid model, quota). Capture and try next model.
        lastErrorDetail = await response.text()
        console.error(`[v0] ElevenLabs API error (model ${modelId}, status ${response.status}):`, lastErrorDetail)

        // Auth / quota errors won't be fixed by switching models — stop early.
        if (response.status === 401 || response.status === 403 || response.status === 429) {
          return NextResponse.json({ error: "ElevenLabs request rejected", detail: lastErrorDetail }, { status: response.status })
        }
      } catch (networkError) {
        // Network-level failure ("fetch failed"). Surface the real cause and try the next model.
        const cause = networkError instanceof Error ? (networkError.cause ?? networkError.message) : String(networkError)
        lastErrorDetail = typeof cause === "string" ? cause : JSON.stringify(cause)
        console.error(`[v0] ElevenLabs fetch failed (model ${modelId}):`, lastErrorDetail)
      }
    }

    return NextResponse.json(
      { error: "Failed to generate speech", detail: lastErrorDetail },
      { status: 502 },
    )
  } catch (error) {
    console.error("[v0] ElevenLabs route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
