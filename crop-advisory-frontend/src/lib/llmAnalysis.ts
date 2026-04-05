import type { TaskId, FarmObservation, AnalysisResult } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.anthropic.com/v1"
const MODEL_NAME = process.env.NEXT_PUBLIC_MODEL_NAME || "claude-3-sonnet-20240229"
const API_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN || ""

/**
 * Strips markdown code blocks (e.g. ```json ... ```) and parses JSON string
 */
function parseLLMResponse(raw: string): any {
  try {
    const jsonStr = raw.replace(/```json/g, "").replace(/```/g, "").trim()
    return JSON.parse(jsonStr)
  } catch (e) {
    console.error("JSON Parse Error:", e, raw)
    return null
  }
}

export async function analyzeCrop(
  imageBase64: string,
  cropName: string,
  taskId: TaskId,
  observation: FarmObservation
): Promise<AnalysisResult> {
  const systemPrompt = `You are an expert agronomist AI. Analyze the crop image provided and respond ONLY with valid JSON. No markdown, no explanation, pure JSON only.`

  const taskPrompts: Record<TaskId, string> = {
    task1_diagnose: `
      Identify the problem affecting this ${cropName} crop.
      Based on the photo and environment details:
      Region: ${observation.region}
      Growth stage: ${observation.growth_stage}
      Symptoms: ${observation.symptoms}

      Respond ONLY with this JSON:
      {
        "diagnosis_category": "nutrient|disease|pest|abiotic",
        "diagnosis": "specific_problem_name",
        "urgency": "low|medium|high|critical",
        "confidence": <float 0.0-1.0>
      }
    `,
    task2_recommend: `
      Diagnose and recommend treatment for this ${cropName} crop.
      Region: ${observation.region}
      Growth stage: ${observation.growth_stage}

      Respond ONLY with this JSON:
      {
        "diagnosis_category": "nutrient|disease|pest|abiotic",
        "diagnosis": "specific_problem_name",
        "urgency": "low|medium|high|critical",
        "treatment": "detailed treatment protocol with product names and dosage",
        "follow_up_days": <integer 1-30>,
        "confidence": <float 0.0-1.0>
      }
    `,
    task3_plan: `
      Diagnose, treat and build a seasonal plan for this ${cropName} crop.
      
      Respond ONLY with this JSON:
      {
        "diagnosis_category": "nutrient|disease|pest|abiotic",
        "diagnosis": "specific_problem_name",
        "urgency": "low|medium|high|critical",
        "treatment": "detailed treatment protocol",
        "follow_up_days": <integer 1-30>,
        "season_plan": [
          "Step 1 action description",
          "Step 2 action description",
          "Step 3 action description",
          "Step 4 action description",
          "Step 5 and 6 if applicable"
        ],
        "confidence": <float 0.0-1.0>
      }
    `
  }

  // MOCK MODE if API token is missing or explicitly disabled
  if (!API_TOKEN || API_TOKEN === "your_api_key_here") {
    console.warn("LLM API token missing. Falling back to Mock analysis.")
    return getMockAnalysis(cropName, taskId)
  }

  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_TOKEN,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageBase64.split(",")[1] || imageBase64
                }
              },
              {
                type: "text",
                text: taskPrompts[taskId]
              }
            ]
          }
        ]
      })
    })

    const data = await response.json()
    const content = data.content?.[0]?.text || "{}"
    const result = parseLLMResponse(content)

    if (result) {
      return {
        ...result,
        raw_response: content,
        parse_success: true,
        confidence: result.confidence || 0.85
      }
    }
  } catch (err) {
    console.error("LLM Analysis Error:", err)
  }

  // Fallback to mock on any failure
  return getMockAnalysis(cropName, taskId, true)
}

function getMockAnalysis(cropName: string, taskId: TaskId, isError = false): AnalysisResult {
  const crop = cropName.toLowerCase()
  
  let diagnosis = "General Pest"
  let treatment = "Apply organic neem oil spray in the evening."
  let category: any = "pest"
  let plan = ["Wash leaves", "Apply spray", "Monitor results", "Second application"]

  if (crop.includes("wheat")) {
    diagnosis = "Nitrogen Deficiency"
    category = "nutrient"
    treatment = "Apply Urea fertilizer at 50kg/ha."
  } else if (crop.includes("potato")) {
    diagnosis = "Late Blight"
    category = "disease"
    treatment = "Apply Mancozeb fungicide."
  } else if (crop.includes("tomato")) {
    diagnosis = "Whitefly Infestation"
    category = "pest"
    treatment = "Introduce predatory mites or apply yellow sticky traps."
  }

  return {
    diagnosis_category: category,
    diagnosis,
    urgency: "high",
    treatment: taskId !== "task1_diagnose" ? treatment : undefined,
    follow_up_days: 7,
    season_plan: taskId === "task3_plan" ? plan : undefined,
    raw_response: "MOCK_MODE_ACTIVE",
    parse_success: !isError,
    confidence: 0.88
  }
}
