import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
export default function Login() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-12">
      <div>
        <AuthForm mode="login" />
        <p className="mt-4 text-center text-sm text-white/45">
          Ainda não tem conta?{' '}
          <Link className="text-violet-300" href="/cadastro">
            Cadastre-se
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link className="text-white/45 hover:text-white" href="/recuperar-senha">
            Esqueci minha senha
          </Link>
        </p>
      </div>
    </div>
  );
}
