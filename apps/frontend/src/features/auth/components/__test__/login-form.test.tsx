import type * as ReactRouter from '@tanstack/react-router';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from '@/features/auth/components/login-form';
import { getToken, useAuthStore } from '@/features/auth/stores/auth-store';

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouter>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: undefined });
  mockNavigate.mockClear();
});

describe('loginForm', () => {
  it('帳密錯誤時顯示「帳號或密碼錯誤」且不導向、不寫入 token', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email Address'), 'admin@superdsp.com');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('帳號或密碼錯誤')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getToken()).toBeUndefined();
  });

  it('帳密正確時設定 token、持久化至 localStorage 並導向 /campaigns', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email Address'), 'admin@superdsp.com');
    await user.type(screen.getByLabelText('Password'), 'Gsp123456');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: '/campaigns' }));
    const token = getToken();
    expect(token).toBeTruthy();
    // AC-02：token 應持久化至 localStorage，refresh 後仍保有登入
    expect(localStorage.getItem('authStore')).toContain(token);
  });

  it('密碼不足 8 字元時欄位下方顯示友善錯誤訊息', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email Address'), 'valid@example.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('密碼至少需要 8 個字元')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('email 格式不合法時標記欄位無效，不進行帳密比對也不導向', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email Address'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'Gsp123456');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByLabelText('Email Address')).toHaveAttribute('aria-invalid', 'true'),
    );
    // 驗證未過時應短路，不應出現帳密比對的通用錯誤
    expect(screen.queryByText('帳號或密碼錯誤')).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('密碼欄位有 autocomplete="current-password" 屬性', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
  });

  it('email 欄位有 autocomplete="email" 屬性', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email Address')).toHaveAttribute('autocomplete', 'email');
  });
});
