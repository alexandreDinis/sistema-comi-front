import 'dotenv/config';

export default {
    expo: {
        owner: "alexandredinis",
        name: "sistema-com-native",
        slug: "sistema-com-native",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/logo-final.png",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true
        },
        android: {
            package: "com.sistemacom.app",
            versionCode: 1,
            adaptiveIcon: {
                foregroundImage: "./assets/logo-final.png",
                backgroundColor: "#ffffff"
            },
            permissions: [
                "USE_BIOMETRIC",
                "USE_FINGERPRINT"
            ],
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            usesCleartextTraffic: true
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        extra: {
            apiUrl: process.env.API_URL,
            enableLogs: process.env.ENABLE_LOGS === 'true',
            environment: process.env.ENVIRONMENT,
            eas: {
                projectId: "0e68daa1-434b-4ca9-bcea-e83adf768bdb"
            }
        }
    }
};
