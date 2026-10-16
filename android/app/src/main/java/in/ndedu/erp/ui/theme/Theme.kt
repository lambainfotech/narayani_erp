package in.ndedu.erp.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val NavyPrimary = Color(0xFF1E3A8A)
val GoldSecondary = Color(0xFFF59E0B)
val SlateBackground = Color(0xFFF8FAFC)
val DarkSurface = Color(0xFF0F172A)
val EmeraldSuccess = Color(0xFF059669)
val RoseError = Color(0xFFE11D48)

private val LightColorScheme = lightColorScheme(
    primary = NavyPrimary,
    secondary = GoldSecondary,
    background = SlateBackground,
    surface = Color.White,
    onPrimary = Color.White,
    onSecondary = DarkSurface,
    onBackground = DarkSurface,
    onSurface = DarkSurface
)

@Composable
fun NdgcErpTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography(),
        content = content
    )
}
