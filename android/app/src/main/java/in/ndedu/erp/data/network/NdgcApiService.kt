package in.ndedu.erp.data.network

import in.ndedu.erp.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface NdgcApiService {
    // 1. Live FastRoute CAPTCHA
    @GET("auth/captcha")
    suspend fun getCaptcha(): Response<CaptchaResponse>

    // 2. FastRoute POST Login
    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    // 3. User Profile
    @GET("auth/profile/")
    suspend fun getProfile(): Response<UserDto>

    // 4. Logout
    @POST("auth/logout/")
    suspend fun logout(): Response<Unit>

    // 5. Students
    @GET("students/online-admissions")
    suspend fun getStudents(
        @Query("q") query: String? = null,
        @Query("course") course: String? = null,
        @Query("year") year: String? = null
    ): Response<List<StudentDto>>

    @POST("students/new")
    suspend fun registerAdmission(
        @Body request: AdmissionRequest
    ): Response<StudentDto>

    // 6. Fees
    @GET("finance/fees")
    suspend fun getFeeLedger(): Response<List<StudentDto>>

    @POST("finance/payments")
    suspend fun recordPayment(
        @Body payment: FeePaymentRequest
    ): Response<ReceiptDto>

    // 7. Attendance
    @POST("attendance.php")
    suspend fun submitAttendance(
        @Body batch: AttendanceBatchDto
    ): Response<Unit>

    // 8. Notices
    @GET("notices.php")
    suspend fun getNotices(): Response<List<NoticeDto>>
}
