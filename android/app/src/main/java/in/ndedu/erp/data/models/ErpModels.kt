package in.ndedu.erp.data.models

import com.google.gson.annotations.SerializedName

data class StudentDto(
    @SerializedName("id") val id: String,
    @SerializedName("scholar_no") val scholarNo: String,
    @SerializedName("enrollment_no") val enrollmentNo: String? = null,
    @SerializedName("name") val name: String,
    @SerializedName("father_name") val fatherName: String,
    @SerializedName("course") val course: String,
    @SerializedName("year") val year: String,
    @SerializedName("mobile") val mobile: String,
    @SerializedName("fee_total") val feeTotal: Long = 0,
    @SerializedName("fee_paid") val feePaid: Long = 0,
    @SerializedName("fee_balance") val feeBalance: Long = 0,
    @SerializedName("attendance_rate") val attendanceRate: Int = 85
)

data class AdmissionRequest(
    @SerializedName("name") val name: String,
    @SerializedName("father_name") val fatherName: String,
    @SerializedName("mother_name") val motherName: String,
    @SerializedName("dob") val dob: String,
    @SerializedName("course") val course: String,
    @SerializedName("year") val year: String,
    @SerializedName("category") val category: String,
    @SerializedName("mobile") val mobile: String,
    @SerializedName("fee_total") val feeTotal: Long,
    @SerializedName("fee_paid") val feePaid: Long
)

data class FeePaymentRequest(
    @SerializedName("student_id") val studentId: String,
    @SerializedName("amount") val amount: Long,
    @SerializedName("payment_mode") val paymentMode: String,
    @SerializedName("transaction_id") val transactionId: String?,
    @SerializedName("remarks") val remarks: String?
)

data class ReceiptDto(
    @SerializedName("receipt_no") val receiptNo: String,
    @SerializedName("date") val date: String,
    @SerializedName("student_name") val studentName: String,
    @SerializedName("paid_amount") val paidAmount: Long,
    @SerializedName("balance_due") val balanceDue: Long,
    @SerializedName("payment_mode") val paymentMode: String
)

data class AttendanceBatchDto(
    @SerializedName("date") val date: String,
    @SerializedName("course") val course: String,
    @SerializedName("year") val year: String,
    @SerializedName("subject") val subject: String,
    @SerializedName("records") val records: List<AttendanceRecordDto>
)

data class AttendanceRecordDto(
    @SerializedName("student_id") val studentId: String,
    @SerializedName("scholar_no") val scholarNo: String,
    @SerializedName("status") val status: String // "present", "absent", "leave"
)

data class NoticeDto(
    @SerializedName("id") val id: String,
    @SerializedName("notice_no") val noticeNo: String,
    @SerializedName("date") val date: String,
    @SerializedName("title") val title: String,
    @SerializedName("title_hi") val titleHi: String? = null,
    @SerializedName("content") val content: String,
    @SerializedName("content_hi") val contentHi: String? = null,
    @SerializedName("priority") val priority: String = "normal"
)
