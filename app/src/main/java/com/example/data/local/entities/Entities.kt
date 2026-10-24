package com.example.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class Subtask(
    val id: String,
    val title: String,
    val isDone: Boolean = false
)

@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val description: String = "",
    val dueDate: String = "", // e.g., "2026-10-24"
    val dueTime: String = "", // e.g., "14:00"
    val priority: String = "Medium", // Low, Medium, High, Urgent
    val category: String = "Work", // Work, Personal, Study, Health, Other
    val isCompleted: Boolean = false,
    val subtasksJson: String = "[]",
    val projectId: Long? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "events")
data class EventEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val description: String = "",
    val date: String, // e.g., "2026-10-24"
    val startTime: String, // e.g., "10:00"
    val endTime: String, // e.g., "11:00"
    val location: String = "",
    val category: String = "Meeting", // Meeting, Focus, Personal, Deadline
    val isAllDay: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "projects")
data class ProjectEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val description: String = "",
    val category: String = "Work",
    val deadline: String = "",
    val milestonesJson: String = "[]",
    val colorHex: String = "#38BDF8",
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "memories")
data class MemoryEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val category: String = "Preferences", // Preferences, Workflows, Goals, Personal, Instructions
    val content: String,
    val isActive: Boolean = true,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "knowledge")
data class KnowledgeEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val content: String,
    val category: String = "Notes", // Notes, Ideas, Resources, Snippets, Book Notes
    val tags: String = "",
    val isPinned: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "reminders")
data class ReminderEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val date: String, // "2026-10-24"
    val time: String, // "09:00"
    val recurrence: String = "Once", // Once, Daily, Weekly
    val priority: String = "Normal", // Normal, Urgent
    val isCompleted: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "conversations")
data class ConversationEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String = "New Conversation",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "chat_messages")
data class ChatMessageEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val conversationId: Long,
    val role: String, // "user", "assistant", "system"
    val content: String,
    val toolName: String? = null,
    val toolPayload: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)
