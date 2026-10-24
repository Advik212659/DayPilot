package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.data.local.daos.*
import com.example.data.local.entities.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        TaskEntity::class,
        EventEntity::class,
        ProjectEntity::class,
        MemoryEntity::class,
        KnowledgeEntity::class,
        ReminderEntity::class,
        ConversationEntity::class,
        ChatMessageEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class DaypilotDatabase : RoomDatabase() {
    abstract fun taskDao(): TaskDao
    abstract fun eventDao(): EventDao
    abstract fun projectDao(): ProjectDao
    abstract fun memoryDao(): MemoryDao
    abstract fun knowledgeDao(): KnowledgeDao
    abstract fun reminderDao(): ReminderDao
    abstract fun chatDao(): ChatDao

    companion object {
        @Volatile
        private var INSTANCE: DaypilotDatabase? = null

        fun getDatabase(context: Context): DaypilotDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    DaypilotDatabase::class.java,
                    "daypilot_database"
                )
                .addCallback(DatabaseCallback())
                .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback : Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    CoroutineScope(Dispatchers.IO).launch {
                        populateInitialData(database)
                    }
                }
            }
        }

        private suspend fun populateInitialData(db: DaypilotDatabase) {
            // Seed Memories
            db.memoryDao().insertMemory(
                MemoryEntity(
                    category = "Preferences",
                    content = "Prefers concise, actionable summaries with bullet points and clear priority labels."
                )
            )
            db.memoryDao().insertMemory(
                MemoryEntity(
                    category = "Workflows",
                    content = "Morning routine includes reviewing high-priority tasks and calendar conflicts before 10 AM."
                )
            )
            db.memoryDao().insertMemory(
                MemoryEntity(
                    category = "Goals",
                    content = "Focused on launching the Daypilot AI Assistant project and maintaining daily deep work sessions."
                )
            )

            // Seed Projects
            val projId = db.projectDao().insertProject(
                ProjectEntity(
                    name = "Daypilot AI Launch",
                    description = "Personal AI copilot for tasks, calendar management, and daily automation.",
                    category = "Work",
                    deadline = "2026-11-01",
                    milestonesJson = """[{"id":"m1","title":"Core Assistant & Chat","isDone":true},{"id":"m2","title":"Task & Calendar Engine","isDone":true},{"id":"m3","title":"Voice & Automations","isDone":true}]""",
                    colorHex = "#38BDF8"
                )
            )

            // Seed Tasks
            db.taskDao().insertTask(
                TaskEntity(
                    title = "Review Q4 Strategy Plan",
                    description = "Check milestone deliverables and budget allocations.",
                    dueDate = "2026-10-24",
                    dueTime = "14:00",
                    priority = "High",
                    category = "Work",
                    subtasksJson = """[{"id":"s1","title":"Inspect metrics","isDone":true},{"id":"s2","title":"Draft executive summary","isDone":false}]""",
                    projectId = projId
                )
            )
            db.taskDao().insertTask(
                TaskEntity(
                    title = "Prepare Daypilot Demo Presentation",
                    description = "Highlight conversational intelligence, voice support, and scheduled automations.",
                    dueDate = "2026-10-24",
                    dueTime = "17:00",
                    priority = "Urgent",
                    category = "Work",
                    subtasksJson = """[{"id":"s3","title":"Record voice demo","isDone":false},{"id":"s4","title":"Outline key features","isDone":true}]""",
                    projectId = projId
                )
            )
            db.taskDao().insertTask(
                TaskEntity(
                    title = "Daily 30-min Reading & Knowledge Synthesis",
                    description = "Read latest AI systems paper and capture insights in knowledge base.",
                    dueDate = "2026-10-24",
                    dueTime = "20:00",
                    priority = "Medium",
                    category = "Study"
                )
            )

            // Seed Events
            db.eventDao().insertEvent(
                EventEntity(
                    title = "Product Strategy Sync",
                    description = "Discuss roadmap, user feedback, and AI agent performance.",
                    date = "2026-10-24",
                    startTime = "10:30",
                    endTime = "11:30",
                    location = "Google Meet",
                    category = "Meeting"
                )
            )
            db.eventDao().insertEvent(
                EventEntity(
                    title = "Deep Focus: Architecture & Logic",
                    description = "Uninterrupted focus session for tool calling and data workflows.",
                    date = "2026-10-24",
                    startTime = "14:00",
                    endTime = "16:00",
                    location = "Desk",
                    category = "Focus"
                )
            )

            // Seed Knowledge Base
            db.knowledgeDao().insertKnowledge(
                KnowledgeEntity(
                    title = "Daypilot Operating Principles",
                    content = "1. Always ground actions in real user data.\n2. Respect privacy and memory control.\n3. Make multi-step tasks seamless.\n4. Keep daily plans focused on high-impact priorities.",
                    category = "Ideas",
                    tags = "ai, principles, guidelines",
                    isPinned = true
                )
            )

            // Seed Reminder
            db.reminderDao().insertReminder(
                ReminderEntity(
                    title = "Review high-priority tasks and calendar schedule",
                    date = "2026-10-24",
                    time = "09:00",
                    recurrence = "Daily",
                    priority = "Normal"
                )
            )

            // Seed Initial Chat
            val convId = db.chatDao().insertConversation(
                ConversationEntity(title = "Welcome to Daypilot")
            )
            db.chatDao().insertMessage(
                ChatMessageEntity(
                    conversationId = convId,
                    role = "assistant",
                    content = "Good day! I am **Daypilot**, your personal AI assistant. I'm connected to your schedule, tasks, projects, and personalized memories. How can I help you organize, plan, or create today?"
                )
            )
        }
    }
}
