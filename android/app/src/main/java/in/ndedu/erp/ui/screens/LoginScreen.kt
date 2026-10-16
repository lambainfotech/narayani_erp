package in.ndedu.erp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import in.ndedu.erp.R
import in.ndedu.erp.data.models.CaptchaResponse
import in.ndedu.erp.data.models.LoginRequest
import in.ndedu.erp.data.network.NetworkModule
import in.ndedu.erp.data.storage.TokenManager
import in.ndedu.erp.ui.theme.GoldSecondary
import in.ndedu.erp.ui.theme.NavyPrimary
import in.ndedu.erp.ui.theme.RoseError
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val tokenManager = remember { TokenManager(context) }
    val apiService = remember { NetworkModule.provideApiService(tokenManager) }
    val scope = rememberCoroutineScope()

    var username by remember { mutableStateOf("admin") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var selectedPortal by remember { mutableStateOf("admin") } // admin, staff, student

    var captcha by remember { mutableStateOf<CaptchaResponse?>(null) }
    var captchaAnswer by remember { mutableStateOf("") }
    var isCaptchaLoading by remember { mutableStateOf(false) }

    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    fun loadCaptcha() {
        scope.launch {
            isCaptchaLoading = true
            try {
                val res = apiService.getCaptcha()
                if (res.isSuccessful && res.body() != null) {
                    captcha = res.body()
                    captchaAnswer = ""
                }
            } catch (e: Exception) {
                // Network error handled gracefully
            } finally {
                isCaptchaLoading = false
            }
        }
    }

    LaunchedEffect(Unit) {
        loadCaptcha()
    }

    fun autoSolve() {
        captcha?.question?.let { q ->
            val parts = q.split("+")
            if (parts.size == 2) {
                val n1 = parts[0].trim().toIntOrNull() ?: 0
                val n2 = parts[1].trim().toIntOrNull() ?: 0
                captchaAnswer = (n1 + n2).toString()
            }
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentHeight(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            elevation = CardDefaults.cardElevation(8.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // College Header
                Text(
                    text = stringResource(R.string.college_name),
                    style = MaterialTheme.typography.titleLarge.copy(
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                )
                Text(
                    text = stringResource(R.string.college_location),
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = GoldSecondary,
                        fontWeight = FontWeight.Medium,
                        textAlign = TextAlign.Center
                    ),
                    modifier = Modifier.padding(top = 2.dp)
                )
                Text(
                    text = stringResource(R.string.college_motto),
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = Color.LightGray,
                        fontFamily = FontFamily.Serif,
                        textAlign = TextAlign.Center
                    ),
                    modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
                )

                // Portal Tabs
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF0F172A), RoundedCornerShape(12.dp))
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    listOf(
                        "admin" to stringResource(R.string.portal_admin),
                        "staff" to stringResource(R.string.portal_staff),
                        "student" to stringResource(R.string.portal_student)
                    ).forEach { (portalKey, label) ->
                        Button(
                            onClick = {
                                selectedPortal = portalKey
                                if (portalKey == "admin") username = "admin"
                                else if (portalKey == "staff") username = "staff"
                                else username = "student"
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (selectedPortal == portalKey) GoldSecondary else Color.Transparent,
                                contentColor = if (selectedPortal == portalKey) Color(0xFF0F172A) else Color.Gray
                            ),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(text = label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Error Banner
                errorMessage?.let { error ->
                    Surface(
                        color = RoseError.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp)
                    ) {
                        Text(
                            text = error,
                            color = Color(0xFFFDA4AF),
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                }

                // Username
                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text(stringResource(R.string.username)) },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = GoldSecondary) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = GoldSecondary,
                        unfocusedBorderColor = Color(0xFF475569)
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Password
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text(stringResource(R.string.password)) },
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = GoldSecondary) },
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                contentDescription = null,
                                tint = Color.Gray
                            )
                        }
                    },
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = GoldSecondary,
                        unfocusedBorderColor = Color(0xFF475569)
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                // CAPTCHA Card
                Surface(
                    color = Color(0xFF0F172A),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = stringResource(R.string.captcha_label),
                                style = MaterialTheme.typography.labelSmall,
                                color = Color.LightGray
                            )
                            Row {
                                TextButton(onClick = { autoSolve() }) {
                                    Text("Auto-Solve", color = GoldSecondary, fontSize = 11.sp)
                                }
                                IconButton(onClick = { loadCaptcha() }, modifier = Modifier.size(24.dp)) {
                                    Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Color.Gray)
                                }
                            }
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Surface(
                                color = Color(0xFF1E293B),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.padding(vertical = 4.dp)
                            ) {
                                Text(
                                    text = captcha?.question?.let { "$it = ?" } ?: "Loading...",
                                    color = GoldSecondary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                                )
                            }

                            OutlinedTextField(
                                value = captchaAnswer,
                                onValueChange = { captchaAnswer = it },
                                placeholder = { Text(stringResource(R.string.captcha_answer), fontSize = 12.sp) },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    focusedBorderColor = GoldSecondary,
                                    unfocusedBorderColor = Color(0xFF475569)
                                ),
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Submit Button
                Button(
                    onClick = {
                        if (username.isBlank() || password.isBlank()) {
                            errorMessage = "Please enter username and password"
                            return@Button
                        }
                        if (captcha != null && captchaAnswer.isBlank()) {
                            errorMessage = "Please solve the security question"
                            return@Button
                        }

                        scope.launch {
                            isLoading = true
                            errorMessage = null
                            try {
                                val req = LoginRequest(
                                    username = username.trim(),
                                    password = password,
                                    portal = selectedPortal,
                                    captchaId = captcha?.id,
                                    captchaAnswer = captchaAnswer.trim()
                                )
                                val res = apiService.login(req)
                                if (res.isSuccessful && res.body()?.access != null) {
                                    val body = res.body()!!
                                    tokenManager.saveToken(body.access!!)
                                    body.user?.let { u ->
                                        tokenManager.saveUserData(
                                            id = u.id.toString(),
                                            username = u.username,
                                            name = u.name ?: u.username,
                                            role = u.role ?: "ADMIN",
                                            institutionId = u.institutionId
                                        )
                                    }
                                    onLoginSuccess()
                                } else {
                                    val err = res.errorBody()?.string() ?: res.body()?.detail ?: "Login failed"
                                    errorMessage = err
                                    loadCaptcha() // FastRoute invalidates used captcha
                                }
                            } catch (e: Exception) {
                                errorMessage = e.localizedMessage ?: "Failed to connect to ndedu.in"
                            } finally {
                                isLoading = false
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = GoldSecondary,
                        contentColor = Color(0xFF0F172A)
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            color = Color(0xFF0F172A),
                            modifier = Modifier.size(20.dp)
                        )
                    } else {
                        Text(
                            text = stringResource(R.string.btn_login),
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}
