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
};

export function authPageCopy(locale: string): AuthPageCopy {
  const zh = locale.startsWith('zh');
  if (zh) {
    return {
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
      nicknamePlaceholder: '可选',
    };
  }
  return {
    loginTitle: 'Sign in to continue',
    loginLead: 'Sign in to sync profiles, readings, and orders',
    loginBtn: 'Sign In',
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
    nicknamePlaceholder: 'Optional',
  };
}
