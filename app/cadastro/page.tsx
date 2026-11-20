import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
export default function Register() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-12">
      <div>
        <AuthForm mode="register" />
        <p className="mt-4 text-center text-sm text-white/45">
          Já possui conta?{' '}
          <Link className="text-violet-300" href="/login">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
