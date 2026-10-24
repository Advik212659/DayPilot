package com.example.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entities.ChatMessageEntity
import com.example.ui.viewmodel.DaypilotViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    viewModel: DaypilotViewModel,
    modifier: Modifier = Modifier
) {
    val messages by viewModel.chatMessages.collectAsState()
    val isGenerating by viewModel.isGenerating.collectAsState()
    val isListening by viewModel.isListening.collectAsState()
    val isSpeaking by viewModel.isSpeaking.collectAsState()
    val inputText by viewModel.chatInputText.collectAsState()
    val conversations by viewModel.conversations.collectAsState()
    val currentConvId by viewModel.currentConversationId.collectAsState()

    val context = LocalContext.current
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    var showDocDialog by remember { mutableStateOf(false) }
    var showConversationsMenu by remember { mutableStateOf(false) }

    // Scroll to bottom when new messages arrive
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.SmartToy,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Daypilot AI",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = if (isGenerating) "Thinking & planning..." else if (isListening) "Listening to voice..." else "Online & ready",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (isGenerating || isListening) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                },
                actions = {
                    // New conversation
                    IconButton(
                        onClick = { viewModel.createNewConversation() },
                        modifier = Modifier.testTag("chat_new_conv_button")
                    ) {
                        Icon(Icons.Default.AddComment, contentDescription = "New Chat")
                    }

                    // Conversation history dropdown
                    Box {
                        IconButton(onClick = { showConversationsMenu = true }) {
                            Icon(Icons.Default.History, contentDescription = "History")
                        }
                        DropdownMenu(
                            expanded = showConversationsMenu,
                            onDismissRequest = { showConversationsMenu = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("+ Start Fresh Chat", fontWeight = FontWeight.Bold) },
                                onClick = {
                                    showConversationsMenu = false
                                    viewModel.createNewConversation()
                                }
                            )
                            Divider()
                            conversations.forEach { conv ->
                                DropdownMenuItem(
                                    text = { Text(conv.title, maxLines = 1) },
                                    onClick = {
                                        showConversationsMenu = false
                                        viewModel.selectConversation(conv.id)
                                    },
                                    leadingIcon = {
                                        if (conv.id == currentConvId) {
                                            Icon(Icons.Default.Check, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                                        }
                                    }
                                )
                            }
                        }
                    }

                    // Voice Mute Toggle
                    val isMuted by viewModel.isMuted.collectAsState()
                    IconButton(onClick = { viewModel.toggleVoiceMute() }) {
                        Icon(
                            imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                            contentDescription = "TTS Voice",
                            tint = if (isMuted) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            )
        },
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .testTag("chat_screen")
        ) {
            // Messages List
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                contentPadding = PaddingValues(vertical = 12.dp)
            ) {
                items(messages) { msg ->
                    ChatMessageBubble(
                        message = msg,
                        onSpeak = { viewModel.speakText(msg.content) },
                        onCopy = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            val clip = ClipData.newPlainText("Daypilot", msg.content)
                            clipboard.setPrimaryClip(clip)
                            viewModel.showMessage("Copied to clipboard")
                        }
                    )
                }

                if (isGenerating) {
                    item {
                        AssistantTypingIndicator()
                    }
                }
            }

            // Quick suggested prompts
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    SuggestionChip(
                        onClick = { viewModel.sendMessage("Plan my day and highlight potential conflicts") },
                        label = { Text("🌅 Plan my day") }
                    )
                }
                item {
                    SuggestionChip(
                        onClick = { viewModel.sendMessage("Add a task to finalize the roadmap tomorrow") },
                        label = { Text("⚡ Add a task") }
                    )
                }
                item {
                    SuggestionChip(
                        onClick = { viewModel.sendMessage("Help me write a concise email to my team") },
                        label = { Text("✍️ Draft email") }
                    )
                }
                item {
                    SuggestionChip(
                        onClick = { viewModel.sendMessage("Break down my current project into subtasks") },
                        label = { Text("🎯 Break down project") }
                    )
                }
            }

            // Input Bar
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.surfaceContainer,
                tonalElevation = 3.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Document intelligence attachment button
                    IconButton(
                        onClick = { showDocDialog = true },
                        modifier = Modifier.testTag("chat_attach_doc_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.AttachFile,
                            contentDescription = "Attach Document / Notes",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }

                    // Text Input
                    OutlinedTextField(
                        value = inputText,
                        onValueChange = { viewModel.onChatInputChanged(it) },
                        placeholder = { Text("Message Daypilot...") },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("chat_message_input"),
                        shape = RoundedCornerShape(24.dp),
                        maxLines = 4
                    )

                    Spacer(modifier = Modifier.width(6.dp))

                    // Voice Input Button
                    IconButton(
                        onClick = {
                            if (isListening) viewModel.stopVoiceInput()
                            else viewModel.startVoiceInput()
                        },
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(
                                if (isListening) MaterialTheme.colorScheme.error
                                else MaterialTheme.colorScheme.secondaryContainer
                            )
                            .testTag("chat_voice_mic_button")
                    ) {
                        Icon(
                            imageVector = if (isListening) Icons.Default.MicOff else Icons.Default.Mic,
                            contentDescription = "Voice Input",
                            tint = if (isListening) MaterialTheme.colorScheme.onError else MaterialTheme.colorScheme.onSecondaryContainer
                        )
                    }

                    Spacer(modifier = Modifier.width(4.dp))

                    // Send Button
                    IconButton(
                        onClick = { viewModel.sendMessage() },
                        enabled = inputText.isNotBlank() && !isGenerating,
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(
                                if (inputText.isNotBlank() && !isGenerating) MaterialTheme.colorScheme.primary
                                else MaterialTheme.colorScheme.surfaceVariant
                            )
                            .testTag("chat_send_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.ArrowUpward,
                            contentDescription = "Send",
                            tint = if (inputText.isNotBlank() && !isGenerating) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }

    if (showDocDialog) {
        DocumentIntelligenceDialog(
            onDismiss = { showDocDialog = false },
            onAnalyze = { docText ->
                showDocDialog = false
                viewModel.sendMessage("Analyze this document, extract key takeaways, and list actionable to-dos:\n\n$docText")
            }
        )
    }
}

@Composable
fun ChatMessageBubble(
    message: ChatMessageEntity,
    onSpeak: () -> Unit,
    onCopy: () -> Unit
) {
    val isUser = message.role == "user"

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        if (!isUser) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.SmartToy,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onPrimaryContainer,
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
        }

        Column(
            modifier = Modifier.widthIn(max = 320.dp),
            horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
        ) {
            Surface(
                shape = RoundedCornerShape(
                    topStart = 18.dp,
                    topEnd = 18.dp,
                    bottomStart = if (isUser) 18.dp else 4.dp,
                    bottomEnd = if (isUser) 4.dp else 18.dp
                ),
                color = if (isUser) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceContainer,
                tonalElevation = if (isUser) 0.dp else 1.dp
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    // Message text
                    Text(
                        text = message.content,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            lineHeight = 22.sp
                        ),
                        color = if (isUser) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                    )

                    // Tool payload badge
                    if (message.toolPayload != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Surface(
                            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Action Completed",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.primary,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            // Controls for assistant messages: Read out & Copy
            if (!isUser) {
                Row(
                    modifier = Modifier.padding(top = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    IconButton(
                        onClick = onSpeak,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.VolumeUp,
                            contentDescription = "Listen",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    IconButton(
                        onClick = onCopy,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ContentCopy,
                            contentDescription = "Copy",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }

        if (isUser) {
            Spacer(modifier = Modifier.width(8.dp))
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.secondaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSecondaryContainer,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}

@Composable
fun AssistantTypingIndicator() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primaryContainer),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.SmartToy,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onPrimaryContainer,
                modifier = Modifier.size(18.dp)
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        Surface(
            shape = RoundedCornerShape(18.dp),
            color = MaterialTheme.colorScheme.surfaceContainer
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "Daypilot is organizing thoughts...",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun DocumentIntelligenceDialog(
    onDismiss: () -> Unit,
    onAnalyze: (String) -> Unit
) {
    var documentContent by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Document & Note Intelligence") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = "Paste text, meeting notes, CSV, or document snippets. Daypilot will summarize and extract actionable to-dos.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                OutlinedTextField(
                    value = documentContent,
                    onValueChange = { documentContent = it },
                    placeholder = { Text("Paste document text here...") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp),
                    maxLines = 10
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { if (documentContent.isNotBlank()) onAnalyze(documentContent) },
                enabled = documentContent.isNotBlank()
            ) {
                Text("Analyze with AI")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}
