package in.ndedu.erp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import in.ndedu.erp.R
import in.ndedu.erp.data.storage.TokenManager
import in.ndedu.erp.ui.theme.EmeraldSuccess
import in.ndedu.erp.ui.theme.GoldSecondary
import in.ndedu.erp.ui.theme.NavyPrimary
import in.ndedu.erp.ui.theme.RoseError

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigate: (String) -> Unit,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val tokenManager = remember { TokenManager(context) }
    val userName = tokenManager.getName() ?: tokenManager.getUsername() ?: "Administrator"

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(stringResource(R.string.college_name), fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text(stringResource(R.string.college_location), fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                    }
                },
                actions = {
                    IconButton(onClick = {
                        tokenManager.clearSession()
                        onLogout()
                    }) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Logout", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = NavyPrimary,
                    titleContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF1F5F9))
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Welcome Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = NavyPrimary)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text(
                            text = "Academic Session 2025-26",
                            fontSize = 11.sp,
                            color = GoldSecondary,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Welcome, $userName",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Narayani Devi Girls College ERP · Powered by FastRoute PHP Backend",
                            fontSize = 12.sp,
                            color = Color.LightGray
                        )
                    }
                }
            }

            // Quick Stats 2x2 Grid
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        title = "Enrolled",
                        value = "1,248",
                        sub = "B.A. · B.Sc. · B.Com",
                        color = NavyPrimary,
                        modifier = Modifier.weight(1f).clickable { onNavigate("students") }
                    )
                    StatCard(
                        title = "Attendance",
                        value = "91.4%",
                        sub = "Today on track",
                        color = EmeraldSuccess,
                        modifier = Modifier.weight(1f).clickable { onNavigate("attendance") }
                    )
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        title = "Fees Collected",
                        value = "₹18.4L",
                        sub = "Session 2025-26",
                        color = GoldSecondary,
                        modifier = Modifier.weight(1f).clickable { onNavigate("fees") }
                    )
                    StatCard(
                        title = "Due Balances",
                        value = "₹4.2L",
                        sub = "Active Alerts",
                        color = RoseError,
                        modifier = Modifier.weight(1f).clickable { onNavigate("fees") }
                    )
                }
            }

            // Quick Action Buttons
            item {
                Text(
                    text = "ERP Quick Actions",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1E293B)
                )
            }

            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    ActionTile(
                        icon = Icons.Default.People,
                        title = stringResource(R.string.students),
                        desc = "Directory, scholar search and admissions",
                        onClick = { onNavigate("students") }
                    )
                    ActionTile(
                        icon = Icons.Default.CreditCard,
                        title = stringResource(R.string.fees),
                        desc = "Tuition collection and verified receipts",
                        onClick = { onNavigate("fees") }
                    )
                    ActionTile(
                        icon = Icons.Default.CheckCircle,
                        title = stringResource(R.string.attendance),
                        desc = "Daily class roll call register",
                        onClick = { onNavigate("attendance") }
                    )
                    ActionTile(
                        icon = Icons.Default.Notifications,
                        title = stringResource(R.string.notices),
                        desc = "University circulars and examination orders",
                        onClick = { onNavigate("notices") }
                    )
                }
            }
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    sub: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = title, fontSize = 11.sp, color = Color.Gray, fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = color)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = sub, fontSize = 10.sp, color = Color.DarkGray)
        }
    }
}

@Composable
fun ActionTile(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    desc: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(1.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                color = NavyPrimary.copy(alpha = 0.1f),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.size(40.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(icon, contentDescription = null, tint = NavyPrimary)
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                Text(text = desc, fontSize = 11.sp, color = Color.Gray)
            }
            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.Gray)
        }
    }
}
