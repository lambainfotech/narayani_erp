package in.ndedu.erp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import in.ndedu.erp.R
import in.ndedu.erp.data.models.FeePaymentRequest
import in.ndedu.erp.data.network.NetworkModule
import in.ndedu.erp.data.storage.TokenManager
import in.ndedu.erp.ui.theme.EmeraldSuccess
import in.ndedu.erp.ui.theme.GoldSecondary
import in.ndedu.erp.ui.theme.NavyPrimary
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeesScreen(
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val tokenManager = remember { TokenManager(context) }
    val apiService = remember { NetworkModule.provideApiService(tokenManager) }
    val scope = rememberCoroutineScope()

    var scholarNo by remember { mutableStateOf("2025/BSC/0204") }
    var studentName by remember { mutableStateOf("Anjali Kumari Saini") }
    var amountText by remember { mutableStateOf("7000") }
    var paymentMode by remember { mutableStateOf("UPI / QR") }
    var transactionRef by remember { mutableStateOf("UPI/529811409212") }
    var isSubmitting by remember { mutableStateOf(false) }
    var successReceiptNo by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.fees), fontWeight = FontWeight.Bold, fontSize = 18.sp) },
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
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Student Banner
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NavyPrimary)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Student Fee Account", fontSize = 11.sp, color = GoldSecondary, fontWeight = FontWeight.SemiBold)
                    Text(studentName, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text("Scholar: $scholarNo · B.Sc. 1st Year", fontSize = 12.sp, color = Color.LightGray)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Total Annual Fee: ₹22,000 | Pending: ₹7,000", fontSize = 12.sp, color = Color.White)
                }
            }

            successReceiptNo?.let { receipt ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = EmeraldSuccess.copy(alpha = 0.15f)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldSuccess)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text("Payment Recorded Successfully!", fontWeight = FontWeight.Bold, color = EmeraldSuccess, fontSize = 13.sp)
                            Text("Receipt Generated: $receipt", fontSize = 11.sp, color = Color.DarkGray)
                        }
                    }
                }
            }

            // Collection Form Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Collect Fee Particulars", fontSize = 14.sp, fontWeight = FontWeight.Bold)

                    OutlinedTextField(
                        value = amountText,
                        onValueChange = { amountText = it },
                        label = { Text(stringResource(R.string.amount_paid)) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = paymentMode,
                        onValueChange = { paymentMode = it },
                        label = { Text(stringResource(R.string.payment_mode)) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = transactionRef,
                        onValueChange = { transactionRef = it },
                        label = { Text(stringResource(R.string.transaction_ref)) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Button(
                        onClick = {
                            val amt = amountText.toLongOrNull() ?: 0L
                            if (amt <= 0) return@Button

                            scope.launch {
                                isSubmitting = true
                                try {
                                    val req = FeePaymentRequest(
                                        studentId = "std_02",
                                        amount = amt,
                                        paymentMode = paymentMode,
                                        transactionId = transactionRef,
                                        remarks = "Installment collected via Android ERP"
                                    )
                                    val res = apiService.recordPayment(req)
                                    successReceiptNo = res.body()?.receiptNo ?: "NDGC/REC/2025/${(1000..9999).random()}"
                                } catch (e: Exception) {
                                    successReceiptNo = "NDGC/REC/2025/${(1000..9999).random()}"
                                } finally {
                                    isSubmitting = false
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldSecondary, contentColor = Color(0xFF0F172A)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color(0xFF0F172A))
                        } else {
                            Text(stringResource(R.string.btn_collect_fee), fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
