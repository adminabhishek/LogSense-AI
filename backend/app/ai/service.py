from openai import AsyncOpenAI
from app.schemas.logs import LogAnalysisResponse
from app.schemas.chat import ChatResponse
import httpx
import json
from typing import Dict, List, Any

openai_client = None
ollama_client = None
minimax_client = None

AI_PROVIDER = "openai"
API_KEY = ""
MODEL = "gpt-3.5-turbo"

MINIMAX_BASE_URL = "https://api.minimax.chat/v1"
MINIMAX_DEFAULT_MODEL = "abab6.5s-chat"

OPENCODE_BASE_URL = "https://opencode.ai/zen"
OPENCODE_DEFAULT_MODEL = "minimax-m2.5-free"


def get_openai_client():
    global openai_client, API_KEY
    if not openai_client and API_KEY:
        openai_client = AsyncOpenAI(api_key=API_KEY)
    return openai_client


def set_ai_config(provider: str, api_key: str, model: str):
    global AI_PROVIDER, API_KEY, MODEL, openai_client, minimax_client
    AI_PROVIDER = provider
    API_KEY = api_key
    MODEL = model
    openai_client = None
    minimax_client = None


LOG_ANALYSIS_PROMPT = """Analyze these logs briefly and concisely:

{logs}

Respond in this JSON format (keep answers short):
{{
    "summary": "1-2 sentences max",
    "issues": ["only the top 3"],
    "severity_breakdown": {{"INFO": 0, "WARNING": 0, "ERROR": 0}},
    "root_causes": ["just 1-2 top causes"],
    "recommendations": ["just 1-2 actions"]
}}

Return ONLY valid JSON without any additional text.
"""

CHAT_PROMPT = """You are an AI Infrastructure Assistant specializing in system monitoring, debugging, and DevOps.

Current system context:
{context}

User question: {question}

Provide a helpful, detailed response. If you need more specific information, mention what would help provide a better answer.
"""


async def analyze_logs_with_ai(logs: List[str]) -> LogAnalysisResponse:
    global AI_PROVIDER

    logs_text = "\n".join([f"- {log}" for log in logs[:30]])
    prompt = LOG_ANALYSIS_PROMPT.format(logs=logs_text)

    if AI_PROVIDER == "openai":
        return await analyze_with_openai(prompt)
    elif AI_PROVIDER == "minimax":
        return await analyze_with_minimax(prompt)
    elif AI_PROVIDER == "opencode":
        return await analyze_with_opencode(prompt)
    else:
        return await analyze_with_ollama(prompt)


async def analyze_with_openai(prompt: str) -> LogAnalysisResponse:
    client = get_openai_client()
    if not client:
        return get_fallback_analysis()

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        content = response.choices[0].message.content
        result = json.loads(content)

        return LogAnalysisResponse(
            summary=result.get("summary", "Analysis complete"),
            issues=result.get("issues", []),
            severity_breakdown=result.get("severity_breakdown", {"INFO": 0, "WARNING": 0, "ERROR": 0}),
            root_causes=result.get("root_causes", []),
            recommendations=result.get("recommendations", [])
        )
    except Exception as e:
        return get_fallback_analysis()


async def analyze_with_ollama(prompt: str) -> LogAnalysisResponse:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "llama2",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30.0
            )

            if response.status_code == 200:
                result = response.json()
                content = result.get("response", "")

                try:
                    parsed = json.loads(content)
                    return LogAnalysisResponse(
                        summary=parsed.get("summary", "Analysis complete"),
                        issues=parsed.get("issues", []),
                        severity_breakdown=parsed.get("severity_breakdown", {"INFO": 0, "WARNING": 0, "ERROR": 0}),
                        root_causes=parsed.get("root_causes", []),
                        recommendations=parsed.get("recommendations", [])
                    )
                except:
                    return LogAnalysisResponse(
                        summary=content[:200],
                        issues=[],
                        severity_breakdown={"INFO": 0, "WARNING": 0, "ERROR": 0},
                        root_causes=[],
                        recommendations=[]
                    )
    except Exception as e:
        pass

    return get_fallback_analysis()


async def analyze_with_minimax(prompt: str) -> LogAnalysisResponse:
    global API_KEY, MODEL
    if not API_KEY:
        return get_fallback_analysis()

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{MINIMAX_BASE_URL}/text/chatcompletion_v2",
                json={
                    "model": MODEL if MODEL else MINIMAX_DEFAULT_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 800
                },
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )

            if response.status_code == 200:
                result = response.json()
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

                try:
                    parsed = json.loads(content)
                    return LogAnalysisResponse(
                        summary=parsed.get("summary", "Analysis complete"),
                        issues=parsed.get("issues", []),
                        severity_breakdown=parsed.get("severity_breakdown", {"INFO": 0, "WARNING": 0, "ERROR": 0}),
                        root_causes=parsed.get("root_causes", []),
                        recommendations=parsed.get("recommendations", [])
                    )
                except:
                    return LogAnalysisResponse(
                        summary=content[:200] if content else "Analysis complete",
                        issues=[],
                        severity_breakdown={"INFO": 0, "WARNING": 0, "ERROR": 0},
                        root_causes=[],
                        recommendations=[]
                    )
    except Exception as e:
        pass

    return get_fallback_analysis()


async def analyze_with_opencode(prompt: str) -> LogAnalysisResponse:
    global API_KEY, MODEL
    if not API_KEY:
        return get_fallback_analysis()

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENCODE_BASE_URL}/v1/chat/completions",
                json={
                    "model": MODEL if MODEL else OPENCODE_DEFAULT_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 800
                },
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )

            if response.status_code == 200:
                result = response.json()
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

                try:
                    parsed = json.loads(content)
                    return LogAnalysisResponse(
                        summary=parsed.get("summary", "Analysis complete"),
                        issues=parsed.get("issues", []),
                        severity_breakdown=parsed.get("severity_breakdown", {"INFO": 0, "WARNING": 0, "ERROR": 0}),
                        root_causes=parsed.get("root_causes", []),
                        recommendations=parsed.get("recommendations", [])
                    )
                except:
                    return LogAnalysisResponse(
                        summary=content[:200] if content else "Analysis complete",
                        issues=[],
                        severity_breakdown={"INFO": 0, "WARNING": 0, "ERROR": 0},
                        root_causes=[],
                        recommendations=[]
                    )
    except Exception as e:
        pass

    return get_fallback_analysis()


def get_fallback_analysis() -> LogAnalysisResponse:
    return LogAnalysisResponse(
        summary="AI analysis service is not configured. Please configure your AI provider in Settings.",
        issues=["AI provider not configured", "No API key provided"],
        severity_breakdown={"INFO": 0, "WARNING": 0, "ERROR": 0},
        root_causes=["Missing AI configuration"],
        recommendations=["Configure OpenAI API key in Settings page", "Or use Ollama for local AI analysis"]
    )


async def chat_with_ai(message: str, context: Dict[str, Any]) -> ChatResponse:
    global AI_PROVIDER

    context_str = json.dumps(context, indent=2)
    prompt = CHAT_PROMPT.format(context=context_str, question=message)

    context_used = []

    if context.get("recent_logs"):
        context_used.append("recent_logs")
    if context.get("active_alerts"):
        context_used.append("active_alerts")

    if AI_PROVIDER == "openai":
        return await chat_with_openai(prompt, context_used)
    elif AI_PROVIDER == "minimax":
        return await chat_with_minimax(prompt, context_used)
    elif AI_PROVIDER == "opencode":
        return await chat_with_opencode(prompt, context_used)
    else:
        return await chat_with_ollama(prompt, context_used)


async def chat_with_openai(prompt: str, context_used: List[str]) -> ChatResponse:
    client = get_openai_client()
    if not client:
        return ChatResponse(
            response="AI chat is not configured. Please configure your AI provider and API key in the Settings page.",
            context_used=[]
        )

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )

        return ChatResponse(
            response=response.choices[0].message.content,
            context_used=context_used
        )
    except Exception as e:
        return ChatResponse(
            response=f"Error: {str(e)}",
            context_used=[]
        )


async def chat_with_ollama(prompt: str, context_used: List[str]) -> ChatResponse:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "llama2",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30.0
            )

            if response.status_code == 200:
                result = response.json()
                return ChatResponse(
                    response=result.get("response", "No response from model"),
                    context_used=context_used
                )
    except Exception as e:
        pass

    return ChatResponse(
        response="Ollama is not available. Please ensure Ollama is running locally or configure OpenAI.",
        context_used=[]
    )


async def chat_with_minimax(prompt: str, context_used: List[str]) -> ChatResponse:
    global API_KEY, MODEL
    if not API_KEY:
        return ChatResponse(
            response="MiniMax API key is not configured. Please add your API key in Settings.",
            context_used=[]
        )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{MINIMAX_BASE_URL}/text/chatcompletion_v2",
                json={
                    "model": MODEL if MODEL else MINIMAX_DEFAULT_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 800
                },
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )

            if response.status_code == 200:
                result = response.json()
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                return ChatResponse(
                    response=content or "No response from MiniMax",
                    context_used=context_used
                )
            else:
                return ChatResponse(
                    response=f"MiniMax API error: {response.status_code}",
                    context_used=[]
                )
    except Exception as e:
        return ChatResponse(
            response=f"Error connecting to MiniMax: {str(e)}",
            context_used=[]
        )


async def chat_with_opencode(prompt: str, context_used: List[str]) -> ChatResponse:
    global API_KEY, MODEL
    if not API_KEY:
        return ChatResponse(
            response="OpenCode API key is not configured. Please add your API key in Settings.",
            context_used=[]
        )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENCODE_BASE_URL}/v1/chat/completions",
                json={
                    "model": MODEL if MODEL else OPENCODE_DEFAULT_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 800
                },
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )

            if response.status_code == 200:
                result = response.json()
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                return ChatResponse(
                    response=content or "No response from OpenCode",
                    context_used=context_used
                )
            else:
                return ChatResponse(
                    response=f"OpenCode API error: {response.status_code} - {response.text}",
                    context_used=[]
                )
    except Exception as e:
        return ChatResponse(
            response=f"Error connecting to OpenCode: {str(e)}",
            context_used=[]
        )