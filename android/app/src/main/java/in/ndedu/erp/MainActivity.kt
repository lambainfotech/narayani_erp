package in.ndedu.erp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import in.ndedu.erp.data.storage.TokenManager
import in.ndedu.erp.ui.screens.*
import in.ndedu.erp.ui.theme.NdgcErpTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val tokenManager = TokenManager(this)

        setContent {
            NdgcErpTheme {
                val navController = rememberNavController()
                val startDest = if (tokenManager.isLoggedIn()) "dashboard" else "login"

                NavHost(navController = navController, startDestination = startDest) {
                    composable("login") {
                        LoginScreen(
                            onLoginSuccess = {
                                navController.navigate("dashboard") {
                                    popUpTo("login") { inclusive = true }
                                }
                            }
                        )
                    }

                    composable("dashboard") {
                        DashboardScreen(
                            onNavigate = { route -> navController.navigate(route) },
                            onLogout = {
                                navController.navigate("login") {
                                    popUpTo("dashboard") { inclusive = true }
                                }
                            }
                        )
                    }

                    composable("students") {
                        StudentsScreen(onBack = { navController.popBackStack() })
                    }

                    composable("fees") {
                        FeesScreen(onBack = { navController.popBackStack() })
                    }

                    composable("attendance") {
                        AttendanceScreen(onBack = { navController.popBackStack() })
                    }

                    composable("notices") {
                        NoticesScreen(onBack = { navController.popBackStack() })
                    }
                }
            }
        }
    }
}
