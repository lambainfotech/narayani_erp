package in.ndedu.erp.data.storage

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys

class TokenManager(context: Context) {
    private val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
    private val prefs = EncryptedSharedPreferences.create(
        "ndgc_erp_secure_session",
        masterKeyAlias,
        context,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveToken(token: String) = prefs.edit().putString(KEY_TOKEN, token).apply()
    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun saveUserData(id: String, username: String, name: String, role: String, institutionId: Int?) {
        prefs.edit()
            .putString(KEY_USER_ID, id)
            .putString(KEY_USERNAME, username)
            .putString(KEY_NAME, name)
            .putString(KEY_ROLE, role)
            .apply()
        institutionId?.let {
            prefs.edit().putString(KEY_INSTITUTION_ID, it.toString()).apply()
        }
    }

    fun getUsername(): String? = prefs.getString(KEY_USERNAME, null)
    fun getName(): String? = prefs.getString(KEY_NAME, null)
    fun getRole(): String? = prefs.getString(KEY_ROLE, null)
    fun getInstitutionId(): String? = prefs.getString(KEY_INSTITUTION_ID, null)

    fun saveBaseUrl(url: String) = prefs.edit().putString(KEY_BASE_URL, url).apply()
    fun getBaseUrl(): String = prefs.getString(KEY_BASE_URL, "https://ndedu.in/erp/api/") ?: "https://ndedu.in/erp/api/"

    fun clearSession() = prefs.edit().clear().apply()

    fun isLoggedIn(): Boolean = !getToken().isNullOrEmpty()

    companion object {
        private const val KEY_TOKEN = "erp_token"
        private const val KEY_USER_ID = "erp_user_id"
        private const val KEY_USERNAME = "erp_username"
        private const val KEY_NAME = "erp_name"
        private const val KEY_ROLE = "erp_role"
        private const val KEY_INSTITUTION_ID = "selected_institution_id"
        private const val KEY_BASE_URL = "erp_base_url"
    }
}
