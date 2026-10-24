package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.audio.VoiceManager
import com.example.data.local.entities.*
import com.example.data.repository.DaypilotRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

enum class AppScreen {
    HOME,
    CHAT,
    TASKS,
    CALENDAR,
    WORKSPACE,
    SETTINGS
}

data class DailyBriefingState(
    val greeting: String = "Welcome back",
    val dateText: String = "",
    val summary: String = "",
    val recommendedFocus: String = "",
    val isLoading: Boolean = false
)

class DaypilotViewModel(application: Application) : AndroidViewModel(application) {

    val repository = DaypilotRepository(application)
    val voiceManager = VoiceManager(application)

    // Navigation
    private val _currentScreen = MutableStateFlow(AppScreen.HOME)
    val currentScreen: StateFlow<AppScreen> = _currentScreen.asStateFlow()

    fun navigateTo(screen: AppScreen) {
        _currentScreen.value = screen
    }

    // Chat
    private val _currentConversationId = MutableStateFlow<Long?>(null)
    val currentConversationId: StateFlow<Long?> = _currentConversationId.asStateFlow()

    val conversations: StateFlow<List<ConversationEntity>> = repository.allConversations
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    @OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
    val chatMessages: StateFlow<List<ChatMessageEntity>> = _currentConversationId
        .flatMapLatest { id ->
            if (id != null) repository.chatDao.getMessagesForConversation(id)
            else flowOf(emptyList())
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _isGenerating = MutableStateFlow(false)
    val isGenerating: StateFlow<Boolean> = _isGenerating.asStateFlow()

    private val _chatInputText = MutableStateFlow("")
    val chatInputText: StateFlow<String> = _chatInputText.asStateFlow()

    // Tasks & Filter
    val tasks: StateFlow<List<TaskEntity>> = repository.allTasks
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val pendingTasks: StateFlow<List<TaskEntity>> = repository.pendingTasks
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _taskSearchQuery = MutableStateFlow("")
    val taskSearchQuery: StateFlow<String> = _taskSearchQuery.asStateFlow()

    private val _taskFilterCategory = MutableStateFlow("All")
    val taskFilterCategory: StateFlow<String> = _taskFilterCategory.asStateFlow()

    // Calendar
    val events: StateFlow<List<EventEntity>> = repository.allEvents
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _selectedDate = MutableStateFlow(repository.getTodayDate())
    val selectedDate: StateFlow<String> = _selectedDate.asStateFlow()

    // Projects, Memories, Knowledge, Reminders
    val projects: StateFlow<List<ProjectEntity>> = repository.allProjects
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val memories: StateFlow<List<MemoryEntity>> = repository.allMemories
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val knowledgeList: StateFlow<List<KnowledgeEntity>> = repository.allKnowledge
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val reminders: StateFlow<List<ReminderEntity>> = repository.allReminders
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Daily Briefing State
    private val _dailyBriefing = MutableStateFlow(DailyBriefingState())
    val dailyBriefing: StateFlow<DailyBriefingState> = _dailyBriefing.asStateFlow()

    // Voice
    val isListening = voiceManager.isListening
    val isSpeaking = voiceManager.isSpeaking
    val isMuted = voiceManager.isMuted
    val speechRate = voiceManager.speechRate

    // Error or Toast Notifications
    private val _snackbarMessage = MutableStateFlow<String?>(null)
    val snackbarMessage: StateFlow<String?> = _snackbarMessage.asStateFlow()

    init {
        viewModelScope.launch {
            val convId = repository.getOrCreateConversationId()
            _currentConversationId.value = convId
            generateBriefing()
        }
    }

    fun clearSnackbar() {
        _snackbarMessage.value = null
    }

    fun showMessage(msg: String) {
        _snackbarMessage.value = msg
    }

    fun onChatInputChanged(text: String) {
        _chatInputText.value = text
    }

    fun sendMessage(customPrompt: String? = null) {
        val prompt = customPrompt ?: _chatInputText.value.trim()
        if (prompt.isBlank()) return

        val convId = _currentConversationId.value ?: return
        _chatInputText.value = ""
        _isGenerating.value = true

        viewModelScope.launch {
            try {
                val assistantMsg = repository.processUserChatMessage(convId, prompt)
                if (!voiceManager.isMuted.value) {
                    voiceManager.speak(assistantMsg.content)
                }
            } catch (e: Exception) {
                _snackbarMessage.value = "Failed to process message: ${e.message}"
            } finally {
                _isGenerating.value = false
            }
        }
    }

    fun startVoiceInput() {
        voiceManager.startListening(
            onResult = { text ->
                if (text.isNotBlank()) {
                    _chatInputText.value = text
                    sendMessage(text)
                }
            },
            onError = { error ->
                _snackbarMessage.value = error
            }
        )
    }

    fun stopVoiceInput() {
        voiceManager.stopListening()
    }

    fun toggleVoiceMute() = voiceManager.toggleMute()
    fun stopSpeaking() = voiceManager.stopSpeaking()
    fun speakText(text: String) = voiceManager.speak(text)
    fun setSpeechRate(rate: Float) = voiceManager.setSpeechRate(rate)

    fun createNewConversation() {
        viewModelScope.launch {
            val id = repository.createNewConversation()
            _currentConversationId.value = id
            repository.chatDao.insertMessage(
                ChatMessageEntity(
                    conversationId = id,
                    role = "assistant",
                    content = "Started a new conversation. What would you like to plan or work on?"
                )
            )
        }
    }

    fun selectConversation(id: Long) {
        _currentConversationId.value = id
    }

    fun generateBriefing() {
        viewModelScope.launch {
            _dailyBriefing.update { it.copy(isLoading = true) }
            val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
            val greeting = when {
                hour < 12 -> "Good morning"
                hour < 17 -> "Good afternoon"
                else -> "Good evening"
            }
            val dateFmt = SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.getDefault())
            val dateText = dateFmt.format(Date())

            val tasksList = repository.pendingTasks.first()
            val eventsList = repository.allEvents.first()
            val todayStr = repository.getTodayDate()
            val todayEvents = eventsList.filter { it.date == todayStr }

            val topTask = tasksList.firstOrNull()
            val summary = if (tasksList.isEmpty() && todayEvents.isEmpty()) {
                "Your schedule is open today with no urgent pending deadlines."
            } else {
                "You have ${todayEvents.size} event(s) scheduled and ${tasksList.size} pending task(s) on your radar."
            }

            val recommended = if (topTask != null) {
                "Recommended: Advance '${topTask.title}' (${topTask.priority} priority) during your morning focus block."
            } else {
                "Recommended: Great time for deep research, planning future goals, or updating knowledge notes."
            }

            _dailyBriefing.value = DailyBriefingState(
                greeting = greeting,
                dateText = dateText,
                summary = summary,
                recommendedFocus = recommended,
                isLoading = false
            )
        }
    }

    // Task Actions
    fun setTaskSearchQuery(query: String) { _taskSearchQuery.value = query }
    fun setTaskFilterCategory(category: String) { _taskFilterCategory.value = category }

    fun addTask(title: String, description: String, dueDate: String, priority: String, category: String) {
        viewModelScope.launch {
            repository.insertTask(
                TaskEntity(
                    title = title,
                    description = description,
                    dueDate = dueDate,
                    priority = priority,
                    category = category
                )
            )
            _snackbarMessage.value = "Task created"
            generateBriefing()
        }
    }

    fun toggleTask(task: TaskEntity) {
        viewModelScope.launch {
            repository.toggleTaskCompleted(task.id, !task.isCompleted)
            generateBriefing()
        }
    }

    fun deleteTask(task: TaskEntity) {
        viewModelScope.launch {
            repository.deleteTask(task)
            _snackbarMessage.value = "Task deleted"
            generateBriefing()
        }
    }

    // Event Actions
    fun setSelectedDate(date: String) {
        _selectedDate.value = date
    }

    fun addEvent(title: String, description: String, date: String, startTime: String, endTime: String, location: String, category: String) {
        viewModelScope.launch {
            repository.insertEvent(
                EventEntity(
                    title = title,
                    description = description,
                    date = date,
                    startTime = startTime,
                    endTime = endTime,
                    location = location,
                    category = category
                )
            )
            _snackbarMessage.value = "Event scheduled"
            generateBriefing()
        }
    }

    fun deleteEvent(event: EventEntity) {
        viewModelScope.launch {
            repository.deleteEvent(event)
            _snackbarMessage.value = "Event removed"
            generateBriefing()
        }
    }

    // Project Actions
    fun addProject(name: String, description: String, category: String, deadline: String) {
        viewModelScope.launch {
            repository.insertProject(
                ProjectEntity(
                    name = name,
                    description = description,
                    category = category,
                    deadline = deadline
                )
            )
            _snackbarMessage.value = "Project created"
        }
    }

    fun deleteProject(project: ProjectEntity) {
        viewModelScope.launch {
            repository.deleteProject(project)
        }
    }

    // Memory Actions
    fun addMemory(category: String, content: String) {
        viewModelScope.launch {
            repository.insertMemory(MemoryEntity(category = category, content = content))
            _snackbarMessage.value = "Memory saved"
        }
    }

    fun toggleMemoryActive(memory: MemoryEntity) {
        viewModelScope.launch {
            repository.updateMemory(memory.copy(isActive = !memory.isActive))
        }
    }

    fun deleteMemory(memory: MemoryEntity) {
        viewModelScope.launch {
            repository.deleteMemory(memory)
        }
    }

    fun clearAllMemories() {
        viewModelScope.launch {
            repository.clearAllMemories()
            _snackbarMessage.value = "All memories cleared"
        }
    }

    // Knowledge Base Actions
    fun addKnowledge(title: String, content: String, category: String, tags: String) {
        viewModelScope.launch {
            repository.insertKnowledge(
                KnowledgeEntity(
                    title = title,
                    content = content,
                    category = category,
                    tags = tags
                )
            )
            _snackbarMessage.value = "Saved to Knowledge Base"
        }
    }

    fun deleteKnowledge(knowledge: KnowledgeEntity) {
        viewModelScope.launch {
            repository.deleteKnowledge(knowledge)
        }
    }

    // Reminder Actions
    fun addReminder(title: String, date: String, time: String, recurrence: String, priority: String) {
        viewModelScope.launch {
            repository.insertReminder(
                ReminderEntity(
                    title = title,
                    date = date,
                    time = time,
                    recurrence = recurrence,
                    priority = priority
                )
            )
            _snackbarMessage.value = "Reminder set"
        }
    }

    fun toggleReminder(reminder: ReminderEntity) {
        viewModelScope.launch {
            repository.toggleReminderCompleted(reminder.id, !reminder.isCompleted)
        }
    }

    fun deleteReminder(reminder: ReminderEntity) {
        viewModelScope.launch {
            repository.deleteReminder(reminder)
        }
    }

    // Quick Automations
    fun runAutomation(type: String, input: String = "") {
        viewModelScope.launch {
            when (type) {
                "meeting_to_tasks" -> {
                    val prompt = "Extract actionable tasks from these notes and format them clearly:\n$input"
                    _currentScreen.value = AppScreen.CHAT
                    sendMessage(prompt)
                }
                "morning_briefing" -> {
                    _currentScreen.value = AppScreen.CHAT
                    sendMessage("Generate my personalized morning briefing and organize my day based on my schedule and tasks.")
                }
                "weekly_review" -> {
                    _currentScreen.value = AppScreen.CHAT
                    sendMessage("Prepare a comprehensive weekly review summarizing my completed tasks, active projects, and upcoming priorities.")
                }
                "project_breakdown" -> {
                    _currentScreen.value = AppScreen.CHAT
                    sendMessage("Break down this goal/project into manageable milestones and concrete tasks:\n$input")
                }
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        voiceManager.release()
    }
}
