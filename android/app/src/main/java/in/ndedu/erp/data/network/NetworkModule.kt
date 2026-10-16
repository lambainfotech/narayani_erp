package in.ndedu.erp.data.network

import in.ndedu.erp.data.storage.TokenManager
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit

object NetworkModule {
    @Volatile
    private var apiService: NdgcApiService? = null

    // In-memory cookie jar to maintain PHPSESSID across CAPTCHA and login
    private val cookieStore = ConcurrentHashMap<String, List<Cookie>>()

    private val sessionCookieJar = object : CookieJar {
        override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
            cookieStore[url.host] = cookies
        }

        override fun loadForRequest(url: HttpUrl): List<Cookie> {
            return cookieStore[url.host] ?: emptyList()
        }
    }

    fun provideApiService(tokenManager: TokenManager): NdgcApiService {
        return apiService ?: synchronized(this) {
            apiService ?: buildRetrofit(tokenManager).also { apiService = it }
        }
    }

    private fun buildRetrofit(tokenManager: TokenManager): NdgcApiService {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val okHttpClient = OkHttpClient.Builder()
            .cookieJar(sessionCookieJar)
            .addInterceptor(AuthInterceptor(tokenManager))
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(tokenManager.getBaseUrl())
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(NdgcApiService::class.java)
    }

    fun resetClient() {
        apiService = null
        cookieStore.clear()
    }
}
