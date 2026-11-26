plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.orasage.tablet"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.orasage.tablet"
        minSdk = 26
        targetSdk = 34
        versionCode = 3
        versionName = "2.1.0"

        // 1280×1024 panel → portrait 1024×1280 shell (portal + BaZi + Ziwei + Tarot + Shop).
        buildConfigField("String", "START_URL", "\"https://orasage.com/zh-CN\"")
        buildConfigField("String", "ALLOWED_HOST_SUFFIX", "\".orasage.com\"")
        buildConfigField("String", "ALLOWED_ROOT_HOST", "\"orasage.com\"")
        buildConfigField("int", "TARGET_WIDTH_PX", "1024")
        buildConfigField("int", "TARGET_HEIGHT_PX", "1280")
    }

    buildFeatures {
        buildConfig = true
        viewBinding = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.activity:activity-ktx:1.9.2")
    implementation("androidx.webkit:webkit:1.11.0")
    implementation("com.google.android.material:material:1.12.0")
}
