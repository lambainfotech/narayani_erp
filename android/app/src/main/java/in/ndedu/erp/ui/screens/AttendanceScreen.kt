package in.ndedu.erp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import in.ndedu.erp.R
import in.ndedu.erp.ui.theme.EmeraldSuccess
import in.ndedu.erp.ui.theme.GoldSecondary
import in.ndedu.erp.ui.theme.NavyPrimary
import in.ndedu.erp.ui.theme.RoseError

data class StudentAttendanceState(
    val id: String,
    val rollNo: String,
    val name: String,
    var status: String // "P", "A", "L"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AttendanceScreen(
    onBack: () -> Unit
) {
    var course by remember { mutableStateOf("B.A. 2nd Year - Sec A") }
    var subject by remember { mutableStateOf("Hindi Literature") }
    var isSubmitted by remember { mutableStateOf(false) }

    val studentStates = remember {
        mutableStateListOf(
            StudentAttendanceState("1", "2401", "Pooja Shekhawat", "P"),
            StudentAttendanceState("2", "2402", "Anjali Kumari Saini", "P"),
            StudentAttendanceState("3", "2403", "Kavita Choudhary", "P"),
            StudentAttendanceState("4", "2404", "Priyanka Meena", "A"),
            StudentAttendanceState("5", "2405", "Manisha Sharma", "P"),
            StudentAttendanceState("6", "2406", "Rekha Verma", "L")
        )
    }

    val presentCount = studentStates.count { it.status == "P" }
    val absentCount = studentStates.count { it.status == "A" }
    val leaveCount = studentStates.count { it.status == "L" }
    val percent = if (studentStates.isNotEmpty()) (presentCount * 100) / studentStates.size else 0

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.attendance), fontWeight = FontWeight.Bold, fontSize = 18.sp) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = NavyPrimary,
                    titleContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFFF8FAFC))
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header Stats Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NavyPrimary)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("$course · $subject", fontSize = 12.sp, color = GoldSecondary, fontWeight = FontWeight.SemiBold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Present: $presentCount", color = EmeraldSuccess, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text("Absent: $absentCount", color = RoseError, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text("Leave: $leaveCount", color = GoldSecondary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text("Total: $percent%", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }
            }

            // Quick All Present / Absent Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = {
                        studentStates.forEachIndexed { i, s ->
                            studentStates[i] = s.copy(status = "P")
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(stringResource(R.string.mark_all_present), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = {
                        studentStates.forEachIndexed { i, s ->
                            studentStates[i] = s.copy(status = "A")
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = RoseError),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(stringResource(R.string.mark_all_absent), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }

            if (isSubmitted) {
                Surface(color = EmeraldSuccess.copy(alpha = 0.15f), shape = RoundedCornerShape(8.dp)) {
                    Text(
                        "Attendance recorded successfully into ERP backend!",
                        color = EmeraldSuccess,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(10.dp)
                    )
                }
            }

            // Student Register List
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                itemsIndexed(studentStates) { index, student ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(1.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    color = Color(0xFFF1F5F9),
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(student.rollNo, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                                    }
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(student.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                            }

                            // P / A / L Action Chips
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                Button(
                                    onClick = { studentStates[index] = student.copy(status = "P") },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (student.status == "P") EmeraldSuccess else Color(0xFFF1F5F9),
                                        contentColor = if (student.status == "P") Color.White else Color.Gray
                                    ),
                                    shape = RoundedCornerShape(6.dp),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp)
                                ) {
                                    Text("P", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }

                                Button(
                                    onClick = { studentStates[index] = student.copy(status = "A") },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (student.status == "A") RoseError else Color(0xFFF1F5F9),
                                        contentColor = if (student.status == "A") Color.White else Color.Gray
                                    ),
                                    shape = RoundedCornerShape(6.dp),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp)
                                ) {
                                    Text("A", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }

                                Button(
                                    onClick = { studentStates[index] = student.copy(status = "L") },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (student.status == "L") GoldSecondary else Color(0xFFF1F5F9),
                                        contentColor = if (student.status == "L") Color(0xFF0F172A) else Color.Gray
                                    ),
                                    shape = RoundedCornerShape(6.dp),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp)
                                ) {
                                    Text("L", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }

            Button(
                onClick = { isSubmitted = true },
                colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Text(stringResource(R.string.btn_submit_attendance), fontWeight = FontWeight.Bold)
            }
        }
    }
}
