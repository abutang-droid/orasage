import { toCoreLocale } from '../../../packages/i18n/src/index.ts';

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
  staffDeniedTitle: string;
  staffDeniedLead: string;
  sessionMismatchTitle: string;
  sessionMismatchLead: string;
  switchAccount: string;
  backHome: string;
};

type CoreLocale = ReturnType<typeof toCoreLocale>;

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
    staffDeniedTitle: '当前账号不能进后台',
    staffDeniedLead: '这个邮箱已经登录，但还不是运营账号。继续登录只会反复回到这一页。请退出后换运营账号，或请管理员提权后再进。',
    sessionMismatchTitle: '后台没收下这次登录',
    sessionMismatchLead: '登录已经成功，但管理后台读不到会话。请退出后重新登录；若仍不行，请管理员核对后台与登录服务的密钥是否一致。',
    switchAccount: '退出并换号',
    backHome: '返回门户',
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
    staffDeniedTitle: '目前帳號不能進後台',
    staffDeniedLead: '這個信箱已經登入，但還不是營運帳號。繼續登入只會反覆回到這一頁。請退出後換營運帳號，或請管理員提權後再進。',
    sessionMismatchTitle: '後台沒收下這次登入',
    sessionMismatchLead: '登入已經成功，但管理後台讀不到工作階段。請退出後重新登入。',
    switchAccount: '退出並換號',
    backHome: '返回門戶',
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
    staffDeniedTitle: 'This account cannot open admin',
    staffDeniedLead: 'You are already signed in, but this email is not a staff account. Signing in again will loop back here. Sign out and use a staff account, or ask an admin to grant access.',
    sessionMismatchTitle: 'Admin did not accept this session',
    sessionMismatchLead: 'Sign-in succeeded, but the admin app could not read the session. Sign out and try again.',
    switchAccount: 'Sign out and switch',
    backHome: 'Back to home',
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
    staffDeniedTitle: 'Esta conta não acessa o admin',
    staffDeniedLead: 'Você já entrou, mas este e-mail não é uma conta da equipe. Entrar de novo só volta para esta página. Saia e use uma conta da equipe.',
    sessionMismatchTitle: 'O admin não aceitou esta sessão',
    sessionMismatchLead: 'O login funcionou, mas o admin não leu a sessão. Saia e tente de novo.',
    switchAccount: 'Sair e trocar de conta',
    backHome: 'Voltar ao início',
  },
};

const normalizeLocale = toCoreLocale;

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
