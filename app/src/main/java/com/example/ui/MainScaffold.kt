package com.example.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.example.ui.screens.*
import com.example.ui.viewmodel.AppScreen
import com.example.ui.viewmodel.DaypilotViewModel

@Composable
fun MainScaffold(
    viewModel: DaypilotViewModel
) {
    val currentScreen by viewModel.currentScreen.collectAsState()
    val snackbarMessage by viewModel.snackbarMessage.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    // Handle back button: return to Home screen if on secondary screen
    BackHandler(enabled = currentScreen != AppScreen.HOME) {
        viewModel.navigateTo(AppScreen.HOME)
    }

    LaunchedEffect(snackbarMessage) {
        snackbarMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.clearSnackbar()
        }
    }

    BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
        val isWideScreen = maxWidth >= 600.dp

        if (isWideScreen) {
            // Adaptive NavigationRail for Foldables / Tablets / Wide Screens
            Row(modifier = Modifier.fillMaxSize()) {
                NavigationRail(
                    modifier = Modifier.testTag("app_navigation_rail"),
                    containerColor = MaterialTheme.colorScheme.surfaceContainer
                ) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.SmartToy,
                            contentDescription = "Daypilot AI",
                            tint = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                    Spacer(modifier = Modifier.height(24.dp))

                    NavigationRailItem(
                        selected = currentScreen == AppScreen.HOME,
                        onClick = { viewModel.navigateTo(AppScreen.HOME) },
                        icon = { Icon(Icons.Default.Dashboard, contentDescription = "Home") },
                        label = { Text("Home") },
                        modifier = Modifier.testTag("nav_rail_home")
                    )
                    NavigationRailItem(
                        selected = currentScreen == AppScreen.CHAT,
                        onClick = { viewModel.navigateTo(AppScreen.CHAT) },
                        icon = { Icon(Icons.AutoMirrored.Filled.Chat, contentDescription = "AI Chat") },
                        label = { Text("Chat") },
                        modifier = Modifier.testTag("nav_rail_chat")
                    )
                    NavigationRailItem(
                        selected = currentScreen == AppScreen.TASKS,
                        onClick = { viewModel.navigateTo(AppScreen.TASKS) },
                        icon = { Icon(Icons.Default.TaskAlt, contentDescription = "Tasks") },
                        label = { Text("Tasks") },
                        modifier = Modifier.testTag("nav_rail_tasks")
                    )
                    NavigationRailItem(
                        selected = currentScreen == AppScreen.CALENDAR,
                        onClick = { viewModel.navigateTo(AppScreen.CALENDAR) },
                        icon = { Icon(Icons.Default.CalendarToday, contentDescription = "Calendar") },
                        label = { Text("Calendar") },
                        modifier = Modifier.testTag("nav_rail_calendar")
                    )
                    NavigationRailItem(
                        selected = currentScreen == AppScreen.WORKSPACE,
                        onClick = { viewModel.navigateTo(AppScreen.WORKSPACE) },
                        icon = { Icon(Icons.Default.Workspaces, contentDescription = "Workspace") },
                        label = { Text("Workspace") },
                        modifier = Modifier.testTag("nav_rail_workspace")
                    )
                    NavigationRailItem(
                        selected = currentScreen == AppScreen.SETTINGS,
                        onClick = { viewModel.navigateTo(AppScreen.SETTINGS) },
                        icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                        label = { Text("Settings") },
                        modifier = Modifier.testTag("nav_rail_settings")
                    )
                }

                Box(modifier = Modifier.weight(1f).fillMaxHeight()) {
                    ScreenContent(currentScreen, viewModel)
                    SnackbarHost(
                        hostState = snackbarHostState,
                        modifier = Modifier.align(Alignment.BottomCenter)
                    )
                }
            }
        } else {
            // Standard Mobile Scaffold with Bottom NavigationBar
            Scaffold(
                bottomBar = {
                    NavigationBar(
                        modifier = Modifier.testTag("app_bottom_bar"),
                        containerColor = MaterialTheme.colorScheme.surfaceContainer
                    ) {
                        NavigationBarItem(
                            selected = currentScreen == AppScreen.HOME,
                            onClick = { viewModel.navigateTo(AppScreen.HOME) },
                            icon = { Icon(Icons.Default.Dashboard, contentDescription = "Home") },
                            label = { Text("Home") },
                            modifier = Modifier.testTag("nav_home")
                        )
                        NavigationBarItem(
                            selected = currentScreen == AppScreen.CHAT,
                            onClick = { viewModel.navigateTo(AppScreen.CHAT) },
                            icon = { Icon(Icons.AutoMirrored.Filled.Chat, contentDescription = "AI Chat") },
                            label = { Text("Chat") },
                            modifier = Modifier.testTag("nav_chat")
                        )
                        NavigationBarItem(
                            selected = currentScreen == AppScreen.TASKS,
                            onClick = { viewModel.navigateTo(AppScreen.TASKS) },
                            icon = { Icon(Icons.Default.TaskAlt, contentDescription = "Tasks") },
                            label = { Text("Tasks") },
                            modifier = Modifier.testTag("nav_tasks")
                        )
                        NavigationBarItem(
                            selected = currentScreen == AppScreen.CALENDAR,
                            onClick = { viewModel.navigateTo(AppScreen.CALENDAR) },
                            icon = { Icon(Icons.Default.CalendarToday, contentDescription = "Calendar") },
                            label = { Text("Calendar") },
                            modifier = Modifier.testTag("nav_calendar")
                        )
                        NavigationBarItem(
                            selected = currentScreen == AppScreen.WORKSPACE,
                            onClick = { viewModel.navigateTo(AppScreen.WORKSPACE) },
                            icon = { Icon(Icons.Default.Workspaces, contentDescription = "Workspace") },
                            label = { Text("Workspace") },
                            modifier = Modifier.testTag("nav_workspace")
                        )
                        NavigationBarItem(
                            selected = currentScreen == AppScreen.SETTINGS,
                            onClick = { viewModel.navigateTo(AppScreen.SETTINGS) },
                            icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                            label = { Text("Settings") },
                            modifier = Modifier.testTag("nav_settings")
                        )
                    }
                },
                snackbarHost = { SnackbarHost(snackbarHostState) },
                modifier = Modifier.fillMaxSize()
            ) { padding ->
                Box(modifier = Modifier.fillMaxSize().padding(padding)) {
                    ScreenContent(currentScreen, viewModel)
                }
            }
        }
    }
}

@Composable
fun ScreenContent(
    screen: AppScreen,
    viewModel: DaypilotViewModel
) {
    when (screen) {
        AppScreen.HOME -> HomeScreen(viewModel = viewModel)
        AppScreen.CHAT -> ChatScreen(viewModel = viewModel)
        AppScreen.TASKS -> TasksScreen(viewModel = viewModel)
        AppScreen.CALENDAR -> CalendarScreen(viewModel = viewModel)
        AppScreen.WORKSPACE -> WorkspaceScreen(viewModel = viewModel)
        AppScreen.SETTINGS -> SettingsScreen(viewModel = viewModel)
    }
}
