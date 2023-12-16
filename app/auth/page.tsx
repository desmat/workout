'use client'

import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from "react";
import useUser from "@/app/_hooks/user";
import { SigninMethod } from "@/types/SigninMethod";
import useAlert from "@/app/_hooks/alert";

function doLogin(e: any, signinFn: any, form: any, router: any, alertFn: any) {
  console.log("** app.profile.auth.page.doLogin");
  e.preventDefault();

  const validationError = 
    !form.email ? `Email must not be empty` :
    !form.password ? `Password must not be empty` :
    undefined;

  if (validationError) {
    alertFn(`Validation error: ${validationError}`);
    return;
  }  

  signinFn("login-email", form).then(() => {
    router.push("/profile");
  })
}

function doSignup(e: any, signinFn: any, form: any, router: any, alertFn: any) {
  console.log("** app.profile.auth.page.doSignup");
  e.preventDefault();

  const validationError = 
    !form.email ? `Email must not be empty` :
    !form.password ? `Password must not be empty` :
    form.password != form.confirmPassword ? `Confirm Password does not match Password`:
    undefined;

  if (validationError) {
    alertFn(`Validation error: ${validationError}`);
    return;
  }  

  signinFn("signup-email", form).then(() => {
    router.push("/profile");
  });
}

type FormInputField = "email" | "password" | "confirmPassword";

function FormInput({
  field, label, form, setForm
}: {
  field: FormInputField,
  label: string,
  form: any,
  setForm: (form: any) => void
}) {
  const fieldType = field == "email" ? "email" : ["password", "confirmPassword"].includes(field) ? "password" : "text";
  return (
    <p>{label}: <input type={fieldType} name={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} /></p>
  );
}

export default function Page() {
  console.log('>> app.profile.auth.page.render()');
  const [user, signin] = useUser((state: any) => [state.user, state.signin]);
  const router = useRouter();
  const params = useSearchParams();
  const method = params.get("method") as SigninMethod;
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [alertError] = useAlert((state: any) => [state.warning]);

  useEffect(() => {
    console.log("** app.profile.auth.page.useEffect", { method });
  }, []);

  return (
    <main className="flex flex-col items-center _justify-between _p-24">
      <h1>
        {method == "login-email" ? "Login" : method == "signup-email" ? "Signup" : "(unknown method)"}
      </h1>
      {!user &&
        <p className='italic text-center animate-pulse'>Loading...</p>
      }
      {user &&
        <>
          <FormInput field="email" label="Email" form={form} setForm={setForm} />
          <FormInput field="password" label="Password" form={form} setForm={setForm} />
          {method == "signup-email" &&
            <FormInput field="confirmPassword" label="Confirm Password" form={form} setForm={setForm} />
          }
        </>
      }
      <div className="flex flex-col lg:flex-row lg:space-x-4 items-center justify-center mt-4">
        <div className="text-dark-2">
          <Link
            href="/"
            onClick={(e) => method == "login-email" ? doLogin(e, signin, form, router, alertError) : method == "signup-email" ? doSignup(e, signin, form, router, alertError) : console.error("Unknown signing method", method)}
          >
            {method == "login-email" ? "Login" : method == "signup-email" ? "Signup" : "(unknown method)"}
          </Link>
        </div>
        <div className="text-dark-2 hover:text-light-2">
          <Link href="/profile">Cancel</Link>
        </div>
      </div>
    </main>
  )
}
