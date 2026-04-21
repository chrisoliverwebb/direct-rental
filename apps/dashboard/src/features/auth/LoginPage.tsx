"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginRequestSchema } from "@repo/api-contracts";
import { DirectRentalLockup } from "@repo/brand";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { useCurrentUser, useLoginMutation } from "@/features/auth/hooks";

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const currentUserQuery = useCurrentUser();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: "owner@directrental.test",
      password: "password123",
    },
  });

  useEffect(() => {
    if (currentUserQuery.isSuccess && currentUserQuery.data) {
      router.replace("/dashboard");
    }
  }, [currentUserQuery.data, currentUserQuery.isSuccess, router]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_36%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative hidden min-h-[640px] overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.36),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.18),_transparent_28%)]" />
            <div className="relative z-10 grid gap-6">
              <DirectRentalLockup
                className="items-start gap-4"
                logoClassName="h-8"
                variant="inverse"
                showSubtitle
                subtitle="Direct booking, owned guest relationships"
                subtitleClassName="max-w-xs text-sm text-slate-300"
              />
              <div className="grid max-w-lg gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">Marketing workspace</p>
                <h1 className="text-4xl font-semibold leading-tight">
                  Build campaigns, manage guests, and keep your brand in control.
                </h1>
                <p className="text-base leading-7 text-slate-300">
                  Step into the dashboard to shape email and SMS journeys, manage consent cleanly, and run everything from one owned system.
                </p>
              </div>
            </div>
            <div className="relative z-10 grid gap-4">
              <div className="grid gap-3 rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm font-medium text-white">Inside the dashboard</p>
                <div className="grid gap-2 text-sm text-slate-300">
                  <p>Contact records with consent-aware marketing status</p>
                  <p>Campaign planning in table and calendar views</p>
                  <p>Visual email building with reusable content blocks</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center px-5 py-8 sm:px-8 lg:px-10">
            <Card className="w-full border-0 bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0">
                <div className="mb-6 lg:hidden">
                  <DirectRentalLockup className="items-start gap-3" logoClassName="h-7" />
                </div>
                <CardTitle className="text-2xl">Sign in</CardTitle>
                <CardDescription className="text-sm">
                  Use the mocked owner account to enter the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <form
                  className="grid gap-4"
                  noValidate
                  onSubmit={form.handleSubmit(async (values) => {
                    await loginMutation.mutateAsync(values);
                    router.push("/dashboard");
                  })}
                >
                  <FormField label="Email" error={form.formState.errors.email?.message} htmlFor="email">
                    <Input id="email" type="email" {...form.register("email")} />
                  </FormField>
                  <FormField label="Password" error={form.formState.errors.password?.message} htmlFor="password">
                    <Input id="password" type="password" {...form.register("password")} />
                  </FormField>
                  {loginMutation.error ? (
                    <p className="text-sm text-destructive">{loginMutation.error.message}</p>
                  ) : null}
                  <Button type="submit" disabled={loginMutation.isPending} className="mt-2">
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
