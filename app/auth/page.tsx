'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from "react";
import Link from "@/app/_components/Link";
import Page, { PageLinks } from "@/app/_components/Page";
import useUser from "@/app/_hooks/user";
import { SigninMethod } from "@/types/SigninMethod";
import useAlert from "@/app/_hooks/alert";
import BackLink from '../_components/BackLink';

type FormInputField = "email" | "password" | "confirmPassword";

function FormInput({
  field, label, form, setForm
}: {
  field: FormInputField,
  label?: string,
  form: any,
  setForm: (form: any) => void
}) {
  const fieldType = field == "email" ? "email" : ["password", "confirmPassword"].includes(field) ? "password" : "text";
  return (
    <p>{label ? `${label}: ` : ""}<input type={fieldType} name={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} /></p>
  );
}

export default function Component() {
  // console.log('>> app.profile.auth.page.render()');
  const [user, signin] = useUser((state: any) => [state.user, state.signin]);
  const router = useRouter();
  const params = useSearchParams();
  const method = params.get("method") as SigninMethod;
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [alertError] = useAlert((state: any) => [state.warning]);

  function doLogin(e: any) {
    // console.log("** app.profile.auth.page.doLogin");
    e.preventDefault();

    const validationError =
      !form.email ? `Email must not be empty` :
        !form.password ? `Password must not be empty` :
          undefined;

    if (validationError) {
      alertError(`Validation error: ${validationError}`);
      return;
    }

    signin("login-email", form).then(() => {
      router.push("/profile");
    })
  }

  function doSignup(e: any) {
    // console.log("** app.profile.auth.page.doSignup");
    e.preventDefault();

    const validationError =
      !form.email ? `Email must not be empty` :
        !form.password ? `Password must not be empty` :
          form.password != form.confirmPassword ? `Confirm Password does not match Password` :
            undefined;

    if (validationError) {
      alertError(`Validation error: ${validationError}`);
      return;
    }

    signin("signup-email", form).then(() => {
      router.push("/profile");
    });
  }

  const submitFn = method == "login-email"
    ? doLogin
    : method == "signup-email"
      ? doSignup
      : () => console.error("Unknown signing method", method);


  function handleKeyDown(e: any) {
    // console.log("** app.profile.auth.page.handleKeyDown", { e });
    if (e.code == "Enter") {
      submitFn(e);
    }
  }

  const bottomLinks = [
    <BackLink key="back" />
  ];

  const links = [
    // <Link key="0" href="/profile">Cancel</Link>,
    <Link
      key="signin"
      href="/"
      onClick={submitFn}
    >
      {method == "login-email"
        ? "Login"
        : method == "signup-email"
          ? "Signup"
          : "(unknown method)"}
    </Link>,
  ];

  return (
    <div onKeyDown={handleKeyDown}>
      <Page
        title={method == "login-email"
          ? "Login"
          : method == "signup-email"
            ? "Signup"
            : "(unknown method)"}
        bottomLinks={bottomLinks}
      >
        <table className="my-1">
          <tbody>
            <tr>
              <td className="text-right pr-2 opacity-40 font-semibold">
                Email
              </td>
              <td>
                <FormInput field="email" form={form} setForm={setForm} />
              </td>
            </tr>
            <tr>
              <td className="text-right pr-2 opacity-40 font-semibold">
                Password
              </td>
              <td>
                <FormInput field="password" form={form} setForm={setForm} />
              </td>
            </tr>
            {method == "signup-email" &&
              <tr>
                <td className="text-right pr-2 opacity-40 font-semibold">
                  Confirm Password
                </td>
                <td>
                  <FormInput field="confirmPassword" form={form} setForm={setForm} />
                </td>
              </tr>
            }
          </tbody>
        </table>
        <div className={`mt-2 mb-4`}>
          <PageLinks>
            {links}
          </PageLinks>
        </div>
      </Page>
    </div>
  )
}
