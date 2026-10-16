import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  X,
  FileCode,
  FolderGit2,
  Download,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface NativeAndroidDocsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NativeAndroidDocs: React.FC<NativeAndroidDocsProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'exportGuide' | 'gradle' | 'network' | 'screens' | 'manifest'>('exportGuide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const EXPORT_GUIDE = `# How to Export APK in Android Studio for Narayani Devi Girls College ERP

1. OPEN PROJECT IN ANDROID STUDIO:
   - Launch Android Studio (Iguana / Jellyfish / Koala / Ladybug).
   - Select "Open" and navigate to the project root folder: /android/
   - Allow Gradle Sync to finish. All libraries (Compose BOM, Retrofit, OkHttp, AndroidX Security) will download automatically.

2. BUILD & EXPORT DEBUG APK:
   - In Android Studio menu: Go to "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"
   - When build finishes, click "locate" in the popup notification to get:
     app/build/outputs/apk/debug/app-debug.apk

3. BUILD SIGNED PRODUCTION RELEASE APK:
   - Go to "Build" > "Generate Signed Bundle / APK"
   - Choose "APK" > Next
   - Select or Create a new KeyStore for Narayani Devi Girls College
   - Choose build variant "release", check V1 and V2 signature boxes, and click Finish!
   - Output path: app/release/app-release.apk

4. COMMAND LINE / TERMINAL EXPORT:
   cd android
   ./gradlew assembleDebug      # For testing on any phone
   ./gradlew assembleRelease    # For production signed release`;

  const APP_BUILD_GRADLE = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "in.ndedu.erp"
    compileSdk = 35

    defaultConfig {
        applicationId = "in.ndedu.erp"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        buildConfigField("String", "BASE_URL", "\\"https://ndedu.in/erp/api/\\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    // Security & Encrypted Session Storage
    implementation(libs.androidx.security.crypto)

    // Retrofit & FastRoute PHP API Client
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.kotlinx.coroutines.android)
}`;

  const NETWORK_MODULE = `package in.ndedu.erp.data.network

import in.ndedu.erp.data.storage.TokenManager
import okhttp3.*
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit

object NetworkModule {
    @Volatile
    private var apiService: NdgcApiService? = null
    private val cookieStore = ConcurrentHashMap<String, List<Cookie>>()

    // Session CookieJar retains PHPSESSID for CAPTCHA math verification
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
        val logging = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }

        val okHttpClient = OkHttpClient.Builder()
            .cookieJar(sessionCookieJar)
            .addInterceptor(AuthInterceptor(tokenManager))
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(tokenManager.getBaseUrl())
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(NdgcApiService::class.java)
    }
}`;

  const TOKEN_MANAGER = `package in.ndedu.erp.data.storage

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

    fun saveToken(token: String) = prefs.edit().putString("erp_token", token).apply()
    fun getToken(): String? = prefs.getString("erp_token", null)

    fun saveUserData(id: String, username: String, name: String, role: String, institutionId: Int?) {
        prefs.edit()
            .putString("erp_user_id", id)
            .putString("erp_username", username)
            .putString("erp_name", name)
            .putString("erp_role", role)
            .apply()
        institutionId?.let {
            prefs.edit().putString("selected_institution_id", it.toString()).apply()
        }
    }

    fun getBaseUrl(): String = prefs.getString("erp_base_url", "https://ndedu.in/erp/api/") ?: "https://ndedu.in/erp/api/"
    fun clearSession() = prefs.edit().clear().apply()
    fun isLoggedIn(): Boolean = !getToken().isNullOrEmpty()
}`;

  const ANDROID_MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="false"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.NarayaniDeviGirlsCollegeERP"
        android:networkSecurityConfig="@xml/network_security_config"
        android:usesCleartextTraffic="false"
        tools:targetApi="35">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Native Android Studio Project &amp; APK Export</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Ready to Build
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Narayani Devi Girls College · Project files created in <code className="font-mono text-emerald-400">/android/</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/NarayaniDeviGirlsCollegeERP-Android.zip"
              download="NarayaniDeviGirlsCollegeERP-Android.zip"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              title="Download Complete Native Android Project as ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Android ZIP</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 py-3 border-b border-slate-800 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveCategory('exportGuide')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'exportGuide'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            📋 APK Export Guide
          </button>
          <button
            onClick={() => setActiveCategory('gradle')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'gradle'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🐘 app/build.gradle.kts
          </button>
          <button
            onClick={() => setActiveCategory('network')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'network'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            ⚡ Network &amp; CookieJar
          </button>
          <button
            onClick={() => setActiveCategory('screens')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'screens'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🔐 Encrypted TokenManager
          </button>
          <button
            onClick={() => setActiveCategory('manifest')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'manifest'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            📜 AndroidManifest.xml
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto py-3 font-mono text-xs">
          {activeCategory === 'exportGuide' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(EXPORT_GUIDE, 'guide')}
                className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer z-10 border border-slate-700"
              >
                {copiedKey === 'guide' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'guide' ? 'Copied!' : 'Copy Instructions'}</span>
              </button>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-amber-300 overflow-x-auto whitespace-pre leading-relaxed">
                {EXPORT_GUIDE}
              </pre>
            </div>
          )}

          {activeCategory === 'gradle' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(APP_BUILD_GRADLE, 'gradle')}
                className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer z-10 border border-slate-700"
              >
                {copiedKey === 'gradle' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'gradle' ? 'Copied!' : 'Copy Gradle Script'}</span>
              </button>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed">
                {APP_BUILD_GRADLE}
              </pre>
            </div>
          )}

          {activeCategory === 'network' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(NETWORK_MODULE, 'net')}
                className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer z-10 border border-slate-700"
              >
                {copiedKey === 'net' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'net' ? 'Copied!' : 'Copy Network Code'}</span>
              </button>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
                {NETWORK_MODULE}
              </pre>
            </div>
          )}

          {activeCategory === 'screens' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(TOKEN_MANAGER, 'token')}
                className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer z-10 border border-slate-700"
              >
                {copiedKey === 'token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'token' ? 'Copied!' : 'Copy TokenManager'}</span>
              </button>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-purple-300 overflow-x-auto whitespace-pre leading-relaxed">
                {TOKEN_MANAGER}
              </pre>
            </div>
          )}

          {activeCategory === 'manifest' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(ANDROID_MANIFEST, 'manifest')}
                className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer z-10 border border-slate-700"
              >
                {copiedKey === 'manifest' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'manifest' ? 'Copied!' : 'Copy Manifest'}</span>
              </button>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
                {ANDROID_MANIFEST}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Target SDK 35 · Kotlin 2.0 · Jetpack Compose BOM · Min SDK 24</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
