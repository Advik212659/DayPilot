package com.example.ui.screens

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.viewmodel.DaypilotViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: DaypilotViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("daypilot_settings", Context.MODE_PRIVATE) }
    val coroutineScope = rememberCoroutineScope()

    var apiKeyInput by remember { mutableStateOf(prefs.getString("custom_api_key", "") ?: "") }
    var selectedModel by remember { mutableStateOf(prefs.getString("selected_model", "gemini-3.5-flash") ?: "gemini-3.5-flash") }
    val speechRate by viewModel.speechRate.collectAsState()
    val isMuted by viewModel.isMuted.collectAsState()

    var isSavedKey by remember { mutableStateOf(apiKeyInput.isNotBlank()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Settings & Privacy",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                }
            )
        },
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .testTag("settings_screen"),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Section 1: AI Provider & Credentials
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.VpnKey, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Gemini AI Provider",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "AI Studio automatically supplies GEMINI_API_KEY from Secrets panel. You may also specify an override key below.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = apiKeyInput,
                            onValueChange = {
                                apiKeyInput = it
                                isSavedKey = false
                            },
                            label = { Text("Custom Gemini API Key (Optional)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            trailingIcon = {
                                if (apiKeyInput.isNotBlank()) {
                                    IconButton(onClick = {
                                        apiKeyInput = ""
                                        prefs.edit().putString("custom_api_key", "").apply()
                                        isSavedKey = false
                                        viewModel.showMessage("Custom API Key cleared")
                                    }) {
                                        Icon(Icons.Default.Clear, contentDescription = "Clear")
                                    }
                                }
                            }
                        )

                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = {
                                    prefs.edit().putString("custom_api_key", apiKeyInput.trim()).apply()
                                    isSavedKey = true
                                    viewModel.showMessage("API Key saved successfully")
                                },
                                enabled = apiKeyInput.isNotBlank() && !isSavedKey
                            ) {
                                Text("Save Key")
                            }

                            OutlinedButton(
                                onClick = {
                                    coroutineScope.launch {
                                        viewModel.showMessage("Testing connection to Gemini...")
                                        val res = viewModel.repository.geminiService.generateContent("Hello Daypilot!")
                                        if (res.isSuccess) {
                                            viewModel.showMessage("✅ Gemini Connection Successful!")
                                        } else {
                                            viewModel.showMessage("Connection note: Using intelligent local engine. Provide valid key in Secrets.")
                                        }
                                    }
                                }
                            ) {
                                Text("Test Connection")
                            }
                        }
                    }
                }
            }

            // Section 2: AI Model Selection
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.ModelTraining, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Model Selection",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        listOf(
                            "gemini-3.5-flash" to "Gemini 3.5 Flash (Fast, optimized for chat & daily planning)",
                            "gemini-3.1-pro-preview" to "Gemini 3.1 Pro (Deep reasoning, complex coding & workflows)"
                        ).forEach { (model, desc) ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = selectedModel == model,
                                    onClick = {
                                        selectedModel = model
                                        prefs.edit().putString("selected_model", model).apply()
                                    }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(text = model, fontWeight = FontWeight.SemiBold)
                                    Text(text = desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                        }
                    }
                }
            }

            // Section 3: Voice Assistant Controls
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.RecordVoiceOver, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Voice Assistant Controls",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Speech Output (Text-To-Speech)")
                            Switch(
                                checked = !isMuted,
                                onCheckedChange = { viewModel.toggleVoiceMute() }
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "Speaking Rate: ${"%.1f".format(speechRate)}x",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        Slider(
                            value = speechRate,
                            onValueChange = { viewModel.setSpeechRate(it) },
                            valueRange = 0.5f..2.0f,
                            steps = 5,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(6.dp))
                        FilledTonalButton(
                            onClick = {
                                viewModel.speakText("Hello! I am Daypilot, your intelligent personal assistant. Voice engine is operational.")
                            }
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Test Voice Readout")
                        }
                    }
                }
            }

            // Section 4: Security & Privacy Guarantee
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Security, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Privacy & Data Sovereignity",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "• All tasks, calendar entries, knowledge notes, and memories are stored safely on your device SQLite database.\n• No voice audio is ever recorded in the background or sold.\n• You maintain full control over long-term memories and can view, toggle, or erase them anytime.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            lineHeight = 20.sp
                        )
                    }
                }
            }

            // Section 5: About Daypilot AI
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Daypilot AI Assistant v1.0",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Think • Plan • Organize • Create • Remember • Automate",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
