"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginRequestSchema } from "@repo/api-contracts";
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use the mocked owner account to enter the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
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
            <Button type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
