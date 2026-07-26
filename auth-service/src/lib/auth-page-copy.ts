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
  /** Shown when login email is not registered */
  emailNotFoundTitle: string;
  emailNotFoundLead: string;
  emailNotFoundRegister: string;
  emailNotFoundRetryPassword: string;
  invalidPassword: string;
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
    emailNotFoundTitle: '这个邮箱还没有注册',
    emailNotFoundLead: '请选择下一步：用该邮箱创建账号，或确认是否密码输入有误。',
    emailNotFoundRegister: '用这个邮箱注册',
    emailNotFoundRetryPassword: '密码输错了，重新输入',
    invalidPassword: '密码错误，请重新输入',
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
    emailNotFoundTitle: 'This email is not registered',
    emailNotFoundLead: 'Choose what to do next: create an account with this email, or retry if the password was wrong.',
    emailNotFoundRegister: 'Register with this email',
    emailNotFoundRetryPassword: 'Wrong password — try again',
    invalidPassword: 'Incorrect password. Please try again.',
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
    emailNotFoundTitle: 'Este e-mail não está cadastrado',
    emailNotFoundLead: 'Escolha o próximo passo: criar conta com este e-mail, ou tentar de novo se a senha estiver errada.',
    emailNotFoundRegister: 'Cadastrar com este e-mail',
    emailNotFoundRetryPassword: 'Senha errada — tentar de novo',
    invalidPassword: 'Senha incorreta. Tente novamente.',
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
    en: 'Request failed',
    'pt-BR': 'Falha na solicitação',
  };
  return map[normalizeLocale(locale)];
}
