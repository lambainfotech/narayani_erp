package in.ndedu.erp.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import in.ndedu.erp.R
import in.ndedu.erp.data.models.StudentDto
import in.ndedu.erp.data.network.NetworkModule
import in.ndedu.erp.data.storage.TokenManager
import in.ndedu.erp.ui.theme.EmeraldSuccess
import in.ndedu.erp.ui.theme.NavyPrimary
import in.ndedu.erp.ui.theme.RoseError
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudentsScreen(
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val tokenManager = remember { TokenManager(context) }
    val apiService = remember { NetworkModule.provideApiService(tokenManager) }
    val scope = rememberCoroutineScope()

    var searchQuery by remember { mutableStateOf("") }
    var selectedCourse by remember { mutableStateOf("All") }
    var students by remember {
        mutableStateOf(
            listOf(
                StudentDto("1", "2024/BA/0101", "SU/2024/09841", "Pooja Shekhawat", "Ranveer Singh", "B.A.", "2nd Year", "9829012345", 18500, 18500, 0, 92),
                StudentDto("2", "2025/BSC/0204", "SU/2025/11202", "Anjali Kumari Saini", "Ramawtar Saini", "B.Sc.", "1st Year", "9414234567", 22000, 15000, 7000, 88),
                StudentDto("3", "2024/BSC/0189", "SU/2024/07629", "Kavita Choudhary", "Rajendra Choudhary", "B.Sc.", "2nd Year", "9784112233", 22000, 22000, 0, 95),
                StudentDto("4", "2023/BA/0055", "SU/2023/04412", "Priyanka Meena", "Mukesh Kumar", "B.A.", "3rd Year", "9660897654", 18500, 12000, 6500, 84)
            )
        )
    }

    LaunchedEffect(Unit) {
        scope.launch {
            try {
                val res = apiService.getStudents()
                if (res.isSuccessful && !res.body().isNullOrEmpty()) {
                    students = res.body()!!
                }
            } catch (e: Exception) {}
        }
    }

    val filteredList = students.filter { s ->
        val matchesQuery = s.name.contains(searchQuery, ignoreCase = true) ||
                s.scholarNo.contains(searchQuery, ignoreCase = true) ||
                s.mobile.contains(searchQuery)
        val matchesCourse = selectedCourse == "All" || s.course == selectedCourse
        matchesQuery && matchesCourse
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.students), fontWeight = FontWeight.Bold, fontSize = 18.sp) },
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
                .padding(16.dp)
        ) {
            // Search Input
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text(stringResource(R.string.student_search_hint), fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Course Filter Chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("All", "B.A.", "B.Sc.", "B.Com").forEach { course ->
                    FilterChip(
                        selected = selectedCourse == course,
                        onClick = { selectedCourse = course },
                        label = { Text(course, fontSize = 11.sp) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Student Cards List
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(filteredList) { student ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(1.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = student.scholarNo,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = NavyPrimary
                                )
                                Text(
                                    text = "${student.course} · ${student.year}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color.DarkGray
                                )
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = student.name,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF0F172A)
                            )
                            Text(
                                text = "Father: ${student.fatherName}",
                                fontSize = 11.sp,
                                color = Color.Gray
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Divider(color = Color(0xFFE2E8F0))
                            Spacer(modifier = Modifier.height(8.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row {
                                    Text("Due: ", fontSize = 11.sp, color = Color.Gray)
                                    Text(
                                        text = if (student.feeBalance > 0) "₹${student.feeBalance}" else "Cleared",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (student.feeBalance > 0) RoseError else EmeraldSuccess
                                    )
                                }
                                Text(
                                    text = "Att: ${student.attendanceRate}%",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = EmeraldSuccess
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
