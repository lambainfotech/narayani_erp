# Narayani Devi Girls College, Sultana — Native Android ERP Project

This folder contains the complete, buildable Native Android application written in **Kotlin** using **Jetpack Compose** (Material 3). It communicates directly with the live FastRoute PHP ERP backend at `https://ndedu.in/erp`.

---

## 🛠️ Project Structure

```
android/
├── build.gradle.kts                   # Root build script
├── settings.gradle.kts                # Project & repository settings
├── gradle.properties                  # JVM & AndroidX flags
├── gradle/
│   └── libs.versions.toml             # Version catalog (AGP 8.5+, Kotlin 2.0+)
└── app/
    ├── build.gradle.kts               # App module build script (Compose + Retrofit)
    └── src/
        └── main/
            ├── AndroidManifest.xml    # Permissions & security rules
            ├── res/
            │   ├── xml/
            │   │   └── network_security_config.xml # TLS enforcement for ndedu.in
            │   ├── values/
            │   │   ├── strings.xml    # English strings
            │   │   └── themes.xml     # Theme styling
            │   └── values-hi/
            │       └── strings.xml    # Hindi (हिन्दी) strings
            └── java/in/ndedu/erp/
                ├── MainActivity.kt    # Root activity & Navigation Compose
                ├── data/
                │   ├── models/        # Auth, Captcha & ERP DTOs
                │   ├── network/       # NdgcApiService, AuthInterceptor, NetworkModule
                │   └── storage/       # EncryptedSharedPreferences TokenManager
                └── ui/
                    ├── theme/         # Color palette & Material 3 theme
                    └── screens/       # Login, Dashboard, Students, Fees, Attendance, Notices
```

---

## 📱 How to Open in Android Studio

1. **Launch Android Studio** (Ladybug, Koala, Jellyfish, or Iguana).
2. Click **Open** (or `File > Open`).
3. Select the `android/` directory from this project root.
4. Wait for Gradle Sync to complete. All dependencies (Jetpack Compose BOM, Retrofit, OkHttp, AndroidX Security Crypto) are resolved automatically via Google & Maven Central repositories.

---

## 🚀 How to Build & Export the APK

### Method 1: Export via Android Studio Menu (Recommended)
1. In Android Studio, go to the top menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
2. Android Studio will compile all Kotlin files and generate the APK.
3. Once completed, a pop-up appears at the bottom-right corner: click **locate** to open the folder containing `app-debug.apk`.
   *(Path: `android/app/build/outputs/apk/debug/app-debug.apk`)*.

### Method 2: Export Signed Production Release APK
1. In Android Studio, select **Build > Generate Signed Bundle / APK**.
2. Select **APK** and click **Next**.
3. Choose your Key Store path (or click *Create New* to create a keystore for Narayani Devi Girls College).
4. Select `release` build variant and choose `V1` and `V2 (Full APK Signature)`.
5. Click **Finish**. Your production-ready APK is generated at `android/app/release/app-release.apk`.

### Method 3: Command Line Terminal
In terminal inside the `android/` folder, run:
```bash
./gradlew assembleDebug
```
For release:
```bash
./gradlew assembleRelease
```

---

## 🔒 Security & Architecture Highlights
- **Direct HTTPS Connection**: Connects to `https://ndedu.in/erp/api/auth/login` and `https://ndedu.in/erp/api/auth/captcha` without WebViews.
- **Session Continuity (CookieJar)**: Retains `PHPSESSID` so math CAPTCHA verification succeeds without mismatch.
- **Hardware-Backed Encryption**: Session tokens and user roles are encrypted using `androidx.security.crypto.EncryptedSharedPreferences` with AES256-GCM.
- **Bilingual Support**: Instant OS locale switching between English and Hindi (हिन्दी).
