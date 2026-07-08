export type AuthPageCopy = {
  loginTitle: string;
  loginLead: string;
  loginBtn: string;
  loginSwitch: string;
  loginSwitchLink: string;
  registerTitle: string;
  registerLead: string;
  registerBtn: string;
  registerSwitch: string;
  registerSwitchLink: string;
  email: string;
  password: string;
  nickname: string;
  nicknamePlaceholder: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
};

type CoreLocale = 'zh-CN' | 'zh-TW' | 'en' | 'pt-BR';

const COPY: Record<CoreLocale, AuthPageCopy> = {
  'zh-CN': {
    loginTitle: '登录以继续',
    loginLead: '登录后可同步测试对象、占卜记录与订单',
    loginBtn: '登录',
    loginSwitch: '没有账号？',
    loginSwitchLink: '立即注册',
    registerTitle: '创建账号',
    registerLead: '注册后可同步命理测试与商城订单',
    registerBtn: '注册',
    registerSwitch: '已有账号？',
    registerSwitchLink: '去登录',
    email: '邮箱',
    password: '密码',
    nickname: '昵称',
    nicknamePlaceholder: '可选，用于显示名称',
    emailPlaceholder: 'name@example.com',
    passwordPlaceholder: '至少 6 位',
  },
  'zh-TW': {
    loginTitle: '登入以繼續',
    loginLead: '登入後可同步測試對象、占卜記錄與訂單',
    loginBtn: '登入',
    loginSwitch: '沒有帳號？',
    loginSwitchLink: '立即註冊',
    registerTitle: '建立帳號',
    registerLead: '註冊後可同步命理測試與商城訂單',
    registerBtn: '註冊',
    registerSwitch: '已有帳號？',
    registerSwitchLink: '去登入',
    email: '電子郵件',
    password: '密碼',
    nickname: '暱稱',
    nicknamePlaceholder: '選填，用於顯示名稱',
    emailPlaceholder: 'name@example.com',
    passwordPlaceholder: '至少 6 個字元',
  },
  en: {
    loginTitle: 'Sign in to continue',
    loginLead: 'Sign in to sync profiles, readings, and orders',
    loginBtn: 'Sign in',
    loginSwitch: 'No account?',
    loginSwitchLink: 'Register',
    registerTitle: 'Create account',
    registerLead: 'Register to sync readings and shop orders',
    registerBtn: 'Register',
    registerSwitch: 'Already have an account?',
    registerSwitchLink: 'Sign in',
    email: 'Email',
    password: 'Password',
    nickname: 'Nickname',
    nicknamePlaceholder: 'Optional display name',
    emailPlaceholder: 'name@example.com',
    passwordPlaceholder: 'At least 6 characters',
  },
  'pt-BR': {
    loginTitle: 'Entrar para continuar',
    loginLead: 'Entre para sincronizar perfis, leituras e pedidos',
    loginBtn: 'Entrar',
    loginSwitch: 'Não tem conta?',
    loginSwitchLink: 'Cadastre-se',
    registerTitle: 'Criar conta',
    registerLead: 'Cadastre-se para sincronizar leituras e pedidos da loja',
    registerBtn: 'Cadastrar',
    registerSwitch: 'Já tem conta?',
    registerSwitchLink: 'Entrar',
    email: 'E-mail',
    password: 'Senha',
    nickname: 'Apelido',
    nicknamePlaceholder: 'Nome de exibição opcional',
    emailPlaceholder: 'name@example.com',
    passwordPlaceholder: 'Pelo menos 6 caracteres',
  },
};

function normalizeLocale(locale: string): CoreLocale {
  if (locale === 'zh-TW') return 'zh-TW';
  if (locale === 'en') return 'en';
  if (locale === 'pt-BR' || locale.startsWith('pt')) return 'pt-BR';
  return 'zh-CN';
}

export function authPageCopy(locale: string): AuthPageCopy {
  return COPY[normalizeLocale(locale)];
}

export function authLoginLabel(locale: string): string {
  return COPY[normalizeLocale(locale)].loginBtn;
}

export function authRequestFailed(locale: string): string {
  const map: Record<CoreLocale, string> = {
    'zh-CN': '请求失败',
    'zh-TW': '請求失敗',
    en: 'Request failed',
    'pt-BR': 'Falha na solicitação',
  };
  return map[normalizeLocale(locale)];
}
