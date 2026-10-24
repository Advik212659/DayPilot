package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entities.KnowledgeEntity
import com.example.data.local.entities.MemoryEntity
import com.example.data.local.entities.ProjectEntity
import com.example.data.local.entities.ReminderEntity
import com.example.ui.viewmodel.AppScreen
import com.example.ui.viewmodel.DaypilotViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkspaceScreen(
    viewModel: DaypilotViewModel,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabTitles = listOf("Projects", "Knowledge", "Automations", "Memories", "Reminders")

    val projects by viewModel.projects.collectAsState()
    val knowledgeList by viewModel.knowledgeList.collectAsState()
    val memories by viewModel.memories.collectAsState()
    val reminders by viewModel.reminders.collectAsState()

    var showAddProjectDialog by remember { mutableStateOf(false) }
    var showAddKnowledgeDialog by remember { mutableStateOf(false) }
    var showAddMemoryDialog by remember { mutableStateOf(false) }
    var showAddReminderDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Workspace & Intelligence",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                }
            )
        },
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .testTag("workspace_screen")
        ) {
            // Scrollable Tab Row
            ScrollableTabRow(
                selectedTabIndex = selectedTab,
                edgePadding = 16.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                tabTitles.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = {
                            Text(
                                text = title,
                                fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            when (selectedTab) {
                0 -> ProjectsTab(
                    projects = projects,
                    onAddClick = { showAddProjectDialog = true },
                    onDelete = { viewModel.deleteProject(it) }
                )
                1 -> KnowledgeTab(
                    knowledgeList = knowledgeList,
                    onAddClick = { showAddKnowledgeDialog = true },
                    onDelete = { viewModel.deleteKnowledge(it) }
                )
                2 -> AutomationsTab(
                    onRunAutomation = { type, input ->
                        viewModel.runAutomation(type, input)
                    }
                )
                3 -> MemoriesTab(
                    memories = memories,
                    onAddClick = { showAddMemoryDialog = true },
                    onToggleActive = { viewModel.toggleMemoryActive(it) },
                    onDelete = { viewModel.deleteMemory(it) },
                    onClearAll = { viewModel.clearAllMemories() }
                )
                4 -> RemindersTab(
                    reminders = reminders,
                    onAddClick = { showAddReminderDialog = true },
                    onToggle = { viewModel.toggleReminder(it) },
                    onDelete = { viewModel.deleteReminder(it) }
                )
            }
        }
    }

    // Dialogs
    if (showAddProjectDialog) {
        AddProjectDialog(
            onDismiss = { showAddProjectDialog = false },
            onConfirm = { name, desc, cat, deadline ->
                viewModel.addProject(name, desc, cat, deadline)
                showAddProjectDialog = false
            }
        )
    }

    if (showAddKnowledgeDialog) {
        AddKnowledgeDialog(
            onDismiss = { showAddKnowledgeDialog = false },
            onConfirm = { title, content, cat, tags ->
                viewModel.addKnowledge(title, content, cat, tags)
                showAddKnowledgeDialog = false
            }
        )
    }

    if (showAddMemoryDialog) {
        AddMemoryDialog(
            onDismiss = { showAddMemoryDialog = false },
            onConfirm = { category, content ->
                viewModel.addMemory(category, content)
                showAddMemoryDialog = false
            }
        )
    }

    if (showAddReminderDialog) {
        AddReminderDialog(
            defaultDate = viewModel.repository.getTodayDate(),
            onDismiss = { showAddReminderDialog = false },
            onConfirm = { title, date, time, rec, priority ->
                viewModel.addReminder(title, date, time, rec, priority)
                showAddReminderDialog = false
            }
        )
    }
}

@Composable
fun ProjectsTab(
    projects: List<ProjectEntity>,
    onAddClick: () -> Unit,
    onDelete: (ProjectEntity) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Active Projects & Goals",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                FilledTonalButton(onClick = onAddClick) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("New Project")
                }
            }
        }

        if (projects.isEmpty()) {
            item {
                EmptyStateCard(message = "No active projects. Plan your goals with Daypilot.")
            }
        } else {
            items(projects, key = { it.id }) { proj ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = proj.name,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            IconButton(onClick = { onDelete(proj) }) {
                                Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                            }
                        }
                        if (proj.description.isNotBlank()) {
                            Text(
                                text = proj.description,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "Category: ${proj.category}", style = MaterialTheme.typography.labelSmall)
                            if (proj.deadline.isNotBlank()) {
                                Text(text = "Target: ${proj.deadline}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        LinearProgressIndicator(
                            progress = { 0.5f },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp))
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun KnowledgeTab(
    knowledgeList: List<KnowledgeEntity>,
    onAddClick: () -> Unit,
    onDelete: (KnowledgeEntity) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    val filtered = knowledgeList.filter {
        searchQuery.isBlank() || it.title.contains(searchQuery, true) || it.content.contains(searchQuery, true) || it.tags.contains(searchQuery, true)
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Personal Knowledge Base",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                FilledTonalButton(onClick = onAddClick) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("New Note")
                }
            }
        }

        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search notes, ideas, snippets...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                singleLine = true
            )
        }

        if (filtered.isEmpty()) {
            item {
                EmptyStateCard(message = "No knowledge items found. Add your first note or idea.")
            }
        } else {
            items(filtered, key = { it.id }) { item ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = item.title,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            IconButton(onClick = { onDelete(item) }) {
                                Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = item.content,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        if (item.tags.isNotBlank()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Tags: ${item.tags}",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AutomationsTab(
    onRunAutomation: (String, String) -> Unit
) {
    var notesInput by remember { mutableStateOf("") }
    var goalInput by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        item {
            Text(
                text = "Daypilot Automation Studio",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Approved multi-step workflows executed automatically by Daypilot.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Automation 1: Morning Briefing
        item {
            AutomationCard(
                icon = Icons.Default.WbSunny,
                title = "Executive Morning Briefing",
                description = "Synthesizes today's schedule, priority tasks, and generates your focus recommendation.",
                buttonText = "Execute Briefing",
                onClick = { onRunAutomation("morning_briefing", "") }
            )
        }

        // Automation 2: Meeting Notes to Action Items
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.AssignmentTurnedIn, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(text = "Meeting Notes to Tasks", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Paste unstructured meeting notes or brainstorm logs to automatically parse into concrete tasks.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = notesInput,
                        onValueChange = { notesInput = it },
                        placeholder = { Text("Paste meeting notes here...") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = { onRunAutomation("meeting_to_tasks", notesInput) },
                        enabled = notesInput.isNotBlank()
                    ) {
                        Text("Extract Action Items & Tasks")
                    }
                }
            }
        }

        // Automation 3: Project Breakdown
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.AccountTree, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(text = "Goal / Project Breakdown Planner", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Input a broad goal to generate milestones, prerequisites, and sequential tasks.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = goalInput,
                        onValueChange = { goalInput = it },
                        placeholder = { Text("e.g., Redesign mobile app or Prepare tax audit...") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = { onRunAutomation("project_breakdown", goalInput) },
                        enabled = goalInput.isNotBlank()
                    ) {
                        Text("Generate Project Plan")
                    }
                }
            }
        }

        // Automation 4: Weekly Review
        item {
            AutomationCard(
                icon = Icons.Default.Summarize,
                title = "Weekly Review & Progress Synthesis",
                description = "Summarizes completed tasks, active milestones, and prepares recommended actions for next week.",
                buttonText = "Run Weekly Review",
                onClick = { onRunAutomation("weekly_review", "") }
            )
        }
    }
}

@Composable
fun MemoriesTab(
    memories: List<MemoryEntity>,
    onAddClick: () -> Unit,
    onToggleActive: (MemoryEntity) -> Unit,
    onDelete: (MemoryEntity) -> Unit,
    onClearAll: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "User-Controlled Long-Term Memory",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Daypilot references active memories across conversations.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                FilledTonalButton(onClick = onAddClick) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Memory")
                }

                if (memories.isNotEmpty()) {
                    OutlinedButton(
                        onClick = onClearAll,
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error)
                    ) {
                        Text("Clear All")
                    }
                }
            }
        }

        if (memories.isEmpty()) {
            item {
                EmptyStateCard(message = "No memories stored yet. Add preferences or routines for Daypilot to remember.")
            }
        } else {
            items(memories, key = { it.id }) { mem ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Switch(
                            checked = mem.isActive,
                            onCheckedChange = { onToggleActive(mem) }
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Surface(
                                color = MaterialTheme.colorScheme.primaryContainer,
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = mem.category,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = mem.content,
                                style = MaterialTheme.typography.bodyMedium,
                                color = if (mem.isActive) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        IconButton(onClick = { onDelete(mem) }) {
                            Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun RemindersTab(
    reminders: List<ReminderEntity>,
    onAddClick: () -> Unit,
    onToggle: (ReminderEntity) -> Unit,
    onDelete: (ReminderEntity) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Smart Reminders",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                FilledTonalButton(onClick = onAddClick) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("New Reminder")
                }
            }
        }

        if (reminders.isEmpty()) {
            item {
                EmptyStateCard(message = "No active reminders. Tap '+ New Reminder' or ask Daypilot.")
            }
        } else {
            items(reminders, key = { it.id }) { rem ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = rem.isCompleted,
                            onCheckedChange = { onToggle(rem) }
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = rem.title,
                                style = MaterialTheme.typography.bodyLarge,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "${rem.date} at ${rem.time} • Recurrence: ${rem.recurrence}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        IconButton(onClick = { onDelete(rem) }) {
                            Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AutomationCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    description: String,
    buttonText: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.width(10.dp))
                Text(text = title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(text = description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(modifier = Modifier.height(12.dp))
            Button(onClick = onClick) {
                Text(buttonText)
            }
        }
    }
}

@Composable
fun EmptyStateCard(message: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun AddProjectDialog(
    onDismiss: () -> Unit,
    onConfirm: (String, String, String, String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Work") }
    var deadline by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("New Project") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Project Name *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = desc, onValueChange = { desc = it }, label = { Text("Description & Goals") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = deadline, onValueChange = { deadline = it }, label = { Text("Target Deadline (YYYY-MM-DD)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            Button(onClick = { if (name.isNotBlank()) onConfirm(name, desc, category, deadline) }, enabled = name.isNotBlank()) {
                Text("Create")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

@Composable
fun AddKnowledgeDialog(
    onDismiss: () -> Unit,
    onConfirm: (String, String, String, String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var content by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Notes") }
    var tags by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Save Note or Idea") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Title *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = content, onValueChange = { content = it }, label = { Text("Content / Notes *") }, modifier = Modifier.fillMaxWidth(), maxLines = 5)
                OutlinedTextField(value = tags, onValueChange = { tags = it }, label = { Text("Tags (comma separated)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            Button(onClick = { if (title.isNotBlank() && content.isNotBlank()) onConfirm(title, content, category, tags) }, enabled = title.isNotBlank() && content.isNotBlank()) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

@Composable
fun AddMemoryDialog(
    onDismiss: () -> Unit,
    onConfirm: (String, String) -> Unit
) {
    var content by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Preferences") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Long-Term Memory") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = "Tell Daypilot what to remember about you (e.g. communication style, workflows, goals).",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                OutlinedTextField(value = content, onValueChange = { content = it }, label = { Text("Memory Content *") }, modifier = Modifier.fillMaxWidth(), maxLines = 3)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("Preferences", "Workflows", "Goals", "Personal").forEach { c ->
                        FilterChip(selected = category == c, onClick = { category = c }, label = { Text(c, fontSize = 11.sp) })
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = { if (content.isNotBlank()) onConfirm(category, content) }, enabled = content.isNotBlank()) {
                Text("Remember")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

@Composable
fun AddReminderDialog(
    defaultDate: String,
    onDismiss: () -> Unit,
    onConfirm: (String, String, String, String, String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var date by remember { mutableStateOf(defaultDate) }
    var time by remember { mutableStateOf("09:00") }
    var recurrence by remember { mutableStateOf("Once") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Create Reminder") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Reminder Title *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = date, onValueChange = { date = it }, label = { Text("Date (YYYY-MM-DD)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = time, onValueChange = { time = it }, label = { Text("Time (HH:MM)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("Once", "Daily", "Weekly").forEach { r ->
                        FilterChip(selected = recurrence == r, onClick = { recurrence = r }, label = { Text(r) })
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = { if (title.isNotBlank()) onConfirm(title, date, time, recurrence, "Normal") }, enabled = title.isNotBlank()) {
                Text("Set Reminder")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}
