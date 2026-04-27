import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        appName: "Zenda",
        tagline: "Your AI receptionist for WhatsApp",
        login: "Log in",
        signup: "Create account",
        email: "Email",
        password: "Password",
        logout: "Log out",
        dashboard: "Dashboard",
        conversations: "Conversations",
        appointments: "Appointments",
        settings: "Settings",
        connected: "Connected",
        disconnected: "Disconnected",
        online: "Online",
        offline: "Offline",
      },
    },
    es: {
      translation: {
        appName: "Zenda",
        tagline: "Tu recepcionista con IA para WhatsApp",
        login: "Iniciar sesión",
        signup: "Crear cuenta",
        email: "Correo electrónico",
        password: "Contraseña",
        logout: "Cerrar sesión",
        dashboard: "Panel",
        conversations: "Conversaciones",
        appointments: "Citas",
        settings: "Configuración",
        connected: "Conectado",
        disconnected: "Desconectado",
        online: "En línea",
        offline: "Desconectado",
      },
    },
  },
});
