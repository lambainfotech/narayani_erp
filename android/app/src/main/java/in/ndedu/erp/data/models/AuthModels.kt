package in.ndedu.erp.data.models

import com.google.gson.annotations.SerializedName

data class CaptchaResponse(
    @SerializedName("id") val id: String,
    @SerializedName("question") val question: String,
    @SerializedName("expires_in") val expiresIn: Int? = 300
)

data class LoginRequest(
    @SerializedName("username") val username: String,
    @SerializedName("password") val password: String,
    @SerializedName("portal") val portal: String? = "admin",
    @SerializedName("institution_id") val institutionId: Int? = null,
    @SerializedName("captcha_id") val captchaId: String? = null,
    @SerializedName("captcha_answer") val captchaAnswer: String? = null
)

data class LoginResponse(
    @SerializedName("access") val access: String? = null,
    @SerializedName("user") val user: UserDto? = null,
    @SerializedName("two_factor_required") val twoFactorRequired: Boolean? = false,
    @SerializedName("temp_token") val tempToken: String? = null,
    @SerializedName("message") val message: String? = null,
    @SerializedName("detail") val detail: String? = null,
    @SerializedName("error") val error: Any? = null
)

data class UserDto(
    @SerializedName("id") val id: Any,
    @SerializedName("username") val username: String,
    @SerializedName("name") val name: String? = null,
    @SerializedName("email") val email: String? = null,
    @SerializedName("role") val role: String? = null,
    @SerializedName("institution_id") val institutionId: Int? = null,
    @SerializedName("institution_name") val institutionName: String? = null
)

data class ErrorResponse(
    @SerializedName("detail") val detail: String? = null,
    @SerializedName("error") val error: Any? = null,
    @SerializedName("message") val message: String? = null
)
