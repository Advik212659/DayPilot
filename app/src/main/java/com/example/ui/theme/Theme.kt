package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = CyanPrimaryDark,
    onPrimary = Color(0xFF003549),
    primaryContainer = Color(0xFF004D68),
    onPrimaryContainer = Color(0xFFBCE9FF),
    secondary = IndigoSecondaryDark,
    onSecondary = Color(0xFF1E1C59),
    secondaryContainer = Color(0xFF353472),
    onSecondaryContainer = Color(0xFFE2DFFF),
    tertiary = EmeraldTertiaryDark,
    onTertiary = Color(0xFF003824),
    tertiaryContainer = Color(0xFF005236),
    onTertiaryContainer = Color(0xFFA6F5C9),
    background = DarkBackground,
    onBackground = TextPrimaryDark,
    surface = DarkSurface,
    onSurface = TextPrimaryDark,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = TextSecondaryDark,
    surfaceContainer = DarkSurfaceContainer
)

private val LightColorScheme = lightColorScheme(
    primary = CyanPrimary,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFC7E7FF),
    onPrimaryContainer = Color(0xFF001E2B),
    secondary = IndigoSecondary,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFE2DFFF),
    onSecondaryContainer = Color(0xFF181552),
    tertiary = EmeraldTertiary,
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFA6F5C9),
    onTertiaryContainer = Color(0xFF002113),
    background = LightBackground,
    onBackground = TextPrimaryLight,
    surface = LightSurface,
    onSurface = TextPrimaryLight,
    surfaceVariant = LightSurfaceVariant,
    onSurfaceVariant = TextSecondaryLight,
    surfaceContainer = LightSurfaceContainer
)

@Composable
fun DaypilotTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Set to false so Daypilot's signature cyan/indigo palette shines
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
