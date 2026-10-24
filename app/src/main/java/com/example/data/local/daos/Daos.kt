package com.example.data.local.daos

import androidx.room.*
import com.example.data.local.entities.*
import kotlinx.coroutines.flow.Flow

@Dao
interface TaskDao {
    @Query("SELECT * FROM tasks ORDER BY isCompleted ASC, createdAt DESC")
    fun getAllTasks(): Flow<List<TaskEntity>>

    @Query("SELECT * FROM tasks WHERE isCompleted = 0 ORDER BY priority DESC, dueDate ASC")
    fun getPendingTasks(): Flow<List<TaskEntity>>

    @Query("SELECT * FROM tasks WHERE dueDate = :date ORDER BY priority DESC")
    fun getTasksByDate(date: String): Flow<List<TaskEntity>>

    @Query("SELECT * FROM tasks WHERE id = :id")
    suspend fun getTaskById(id: Long): TaskEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTask(task: TaskEntity): Long

    @Update
    suspend fun updateTask(task: TaskEntity)

    @Delete
    suspend fun deleteTask(task: TaskEntity)

    @Query("DELETE FROM tasks WHERE id = :id")
    suspend fun deleteTaskById(id: Long)

    @Query("UPDATE tasks SET isCompleted = :isCompleted WHERE id = :id")
    suspend fun setTaskCompleted(id: Long, isCompleted: Boolean)

    @Query("SELECT COUNT(*) FROM tasks WHERE isCompleted = 0")
    fun getPendingCount(): Flow<Int>
}

@Dao
interface EventDao {
    @Query("SELECT * FROM events ORDER BY date ASC, startTime ASC")
    fun getAllEvents(): Flow<List<EventEntity>>

    @Query("SELECT * FROM events WHERE date = :date ORDER BY startTime ASC")
    fun getEventsByDate(date: String): Flow<List<EventEntity>>

    @Query("SELECT * FROM events WHERE date >= :startDate ORDER BY date ASC, startTime ASC")
    fun getUpcomingEvents(startDate: String): Flow<List<EventEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvent(event: EventEntity): Long

    @Update
    suspend fun updateEvent(event: EventEntity)

    @Delete
    suspend fun deleteEvent(event: EventEntity)

    @Query("DELETE FROM events WHERE id = :id")
    suspend fun deleteEventById(id: Long)
}

@Dao
interface ProjectDao {
    @Query("SELECT * FROM projects ORDER BY createdAt DESC")
    fun getAllProjects(): Flow<List<ProjectEntity>>

    @Query("SELECT * FROM projects WHERE id = :id")
    suspend fun getProjectById(id: Long): ProjectEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProject(project: ProjectEntity): Long

    @Update
    suspend fun updateProject(project: ProjectEntity)

    @Delete
    suspend fun deleteProject(project: ProjectEntity)
}

@Dao
interface MemoryDao {
    @Query("SELECT * FROM memories ORDER BY createdAt DESC")
    fun getAllMemories(): Flow<List<MemoryEntity>>

    @Query("SELECT * FROM memories WHERE isActive = 1 ORDER BY createdAt DESC")
    suspend fun getActiveMemories(): List<MemoryEntity>

    @Query("SELECT * FROM memories WHERE isActive = 1 ORDER BY createdAt DESC")
    fun observeActiveMemories(): Flow<List<MemoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMemory(memory: MemoryEntity): Long

    @Update
    suspend fun updateMemory(memory: MemoryEntity)

    @Delete
    suspend fun deleteMemory(memory: MemoryEntity)

    @Query("DELETE FROM memories")
    suspend fun clearAllMemories()
}

@Dao
interface KnowledgeDao {
    @Query("SELECT * FROM knowledge ORDER BY isPinned DESC, createdAt DESC")
    fun getAllKnowledge(): Flow<List<KnowledgeEntity>>

    @Query("SELECT * FROM knowledge WHERE title LIKE '%' || :query || '%' OR content LIKE '%' || :query || '%' OR tags LIKE '%' || :query || '%'")
    fun searchKnowledge(query: String): Flow<List<KnowledgeEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertKnowledge(knowledge: KnowledgeEntity): Long

    @Update
    suspend fun updateKnowledge(knowledge: KnowledgeEntity)

    @Delete
    suspend fun deleteKnowledge(knowledge: KnowledgeEntity)
}

@Dao
interface ReminderDao {
    @Query("SELECT * FROM reminders ORDER BY isCompleted ASC, date ASC, time ASC")
    fun getAllReminders(): Flow<List<ReminderEntity>>

    @Query("SELECT * FROM reminders WHERE isCompleted = 0 ORDER BY date ASC, time ASC")
    fun getActiveReminders(): Flow<List<ReminderEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReminder(reminder: ReminderEntity): Long

    @Update
    suspend fun updateReminder(reminder: ReminderEntity)

    @Delete
    suspend fun deleteReminder(reminder: ReminderEntity)

    @Query("UPDATE reminders SET isCompleted = :isCompleted WHERE id = :id")
    suspend fun setReminderCompleted(id: Long, isCompleted: Boolean)
}

@Dao
interface ChatDao {
    @Query("SELECT * FROM conversations ORDER BY updatedAt DESC")
    fun getAllConversations(): Flow<List<ConversationEntity>>

    @Query("SELECT * FROM chat_messages WHERE conversationId = :convId ORDER BY timestamp ASC")
    fun getMessagesForConversation(convId: Long): Flow<List<ChatMessageEntity>>

    @Query("SELECT * FROM chat_messages WHERE conversationId = :convId ORDER BY timestamp ASC")
    suspend fun getMessagesList(convId: Long): List<ChatMessageEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertConversation(conversation: ConversationEntity): Long

    @Update
    suspend fun updateConversation(conversation: ConversationEntity)

    @Delete
    suspend fun deleteConversation(conversation: ConversationEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: ChatMessageEntity): Long

    @Query("DELETE FROM chat_messages WHERE conversationId = :convId")
    suspend fun clearMessagesForConversation(convId: Long)
}
