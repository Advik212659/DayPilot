package com.example.data.api

import android.content.Context
import android.util.Log
import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class GeminiService(private val context: Context) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    fun getApiKey(): String {
        val prefs = context.getSharedPreferences("daypilot_settings", Context.MODE_PRIVATE)
        val customKey = prefs.getString("custom_api_key", "") ?: ""
        if (customKey.isNotBlank()) return customKey
        
        // Try BuildConfig.GEMINI_API_KEY
        val buildConfigKey = try {
            BuildConfig.GEMINI_API_KEY
        } catch (e: Throwable) {
            ""
        }
        return if (buildConfigKey != "MY_GEMINI_API_KEY") buildConfigKey else ""
    }

    suspend fun generateContent(
        prompt: String,
        systemInstruction: String = "",
        model: String = "gemini-3.5-flash",
        history: List<Pair<String, String>> = emptyList() // role ("user"/"model") to content
    ): Result<String> = withContext(Dispatchers.IO) {
        val apiKey = getApiKey()
        if (apiKey.isBlank()) {
            return@withContext Result.failure(Exception("NO_API_KEY"))
        }

        try {
            val url = "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey"
            
            val jsonBody = JSONObject().apply {
                // Contents
                val contentsArray = JSONArray()
                
                // Add conversation history
                for ((role, text) in history) {
                    val contentObj = JSONObject().apply {
                        put("role", if (role == "assistant") "model" else "user")
                        put("parts", JSONArray().put(JSONObject().put("text", text)))
                    }
                    contentsArray.put(contentObj)
                }

                // Add current prompt
                val currentTurn = JSONObject().apply {
                    put("role", "user")
                    put("parts", JSONArray().put(JSONObject().put("text", prompt)))
                }
                contentsArray.put(currentTurn)

                put("contents", contentsArray)

                // System Instruction
                if (systemInstruction.isNotBlank()) {
                    put("systemInstruction", JSONObject().apply {
                        put("parts", JSONArray().put(JSONObject().put("text", systemInstruction)))
                    })
                }

                // Generation Config
                put("generationConfig", JSONObject().apply {
                    put("temperature", 0.7)
                    put("topP", 0.95)
                    put("maxOutputTokens", 2048)
                })
            }

            val requestBody = jsonBody.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url(url)
                .post(requestBody)
                .build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                Log.e("GeminiService", "API error: ${response.code} $responseBody")
                return@withContext Result.failure(Exception("API Error (${response.code}): $responseBody"))
            }

            val jsonResponse = JSONObject(responseBody)
            val candidates = jsonResponse.optJSONArray("candidates")
            if (candidates != null && candidates.length() > 0) {
                val candidate = candidates.getJSONObject(0)
                val content = candidate.optJSONObject("content")
                val parts = content?.optJSONArray("parts")
                if (parts != null && parts.length() > 0) {
                    val text = parts.getJSONObject(0).optString("text", "")
                    return@withContext Result.success(text)
                }
            }

            Result.failure(Exception("No content returned from AI model"))
        } catch (e: Exception) {
            Log.e("GeminiService", "Network or parsing exception", e)
            Result.failure(e)
        }
    }
}
