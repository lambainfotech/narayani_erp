package in.ndedu.erp.data.network

import in.ndedu.erp.data.storage.TokenManager
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val tokenManager: TokenManager) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val builder = original.newBuilder()
            .header("Accept", "application/json")
            .header("X-Requested-With", "XMLHttpRequest")

        // Inject Bearer token if logged in
        tokenManager.getToken()?.let { token ->
            builder.header("Authorization", "Bearer $token")
            builder.header("X-Access-Token", token)
        }

        tokenManager.getInstitutionId()?.let { instId ->
            builder.header("X-Institution-Id", instId)
        }

        val response = chain.proceed(builder.build())

        // Handle token expiry
        if (response.code == 401 && !original.url.encodedPath.contains("auth/login")) {
            tokenManager.clearSession()
        }

        return response
    }
}
