package in.ndedu.erp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import in.ndedu.erp.R
import in.ndedu.erp.data.models.NoticeDto
import in.ndedu.erp.ui.theme.NavyPrimary
import in.ndedu.erp.ui.theme.RoseError

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NoticesScreen(
    onBack: () -> Unit
) {
    val notices = remember {
        listOf(
            NoticeDto(
                id = "1",
                noticeNo = "NDGC/2025/EXAM/104",
                date = "2025-10-15",
                title = "University Main Examination Form 2025-26",
                titleHi = "शेखावाटी विश्वविद्यालय मुख्य परीक्षा फॉर्म 2025-26",
                content = "Regular undergraduate students must submit examination forms along with fee receipt by October 28, 2025.",
                contentHi = "समस्त नियमित छात्राएं 28 अक्टूबर 2025 तक मुख्य परीक्षा फॉर्म कार्यालय में अनिवार्य रूप से जमा कराएं।",
                priority = "urgent"
            ),
            NoticeDto(
                id = "2",
                noticeNo = "NDGC/2025/ACAD/098",
                date = "2025-10-10",
                title = "Mid-Term Assessment & Practical Schedule",
                titleHi = "आंतरिक मूल्यांकन व प्रायोगिक कार्य समय सारणी",
                content = "Continuous internal assessment tests begin November 05, 2025. Minimum 75% attendance is required.",
                contentHi = "आंतरिक परीक्षाएं 05 नवंबर से प्रारंभ होंगी। 75% न्यूनतम उपस्थिति अनिवार्य है।",
                priority = "normal"
            )
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.notices), fontWeight = FontWeight.Bold, fontSize = 18.sp) },
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
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFFF8FAFC))
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(notices) { notice ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(notice.noticeNo, fontSize = 11.sp, color = NavyPrimary, fontWeight = FontWeight.Bold)
                            if (notice.priority == "urgent") {
                                Surface(color = RoseError.copy(alpha = 0.15f), shape = RoundedCornerShape(4.dp)) {
                                    Text("URGENT", color = RoseError, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(notice.title, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                        notice.titleHi?.let {
                            Text(it, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Color.DarkGray)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(notice.content, fontSize = 12.sp, color = Color.Gray, lineHeight = 18.sp)
                        Spacer(modifier = Modifier.height(10.dp))
                        Text("Date: ${notice.date}", fontSize = 10.sp, color = Color.LightGray)
                    }
                }
            }
        }
    }
}
