"use client";

import { useState } from "react";
import { ExternalLink, KeyRound } from "lucide-react";
import { formatDate } from "@repo/shared";
import type { SubscriptionStatus } from "@repo/api-contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/ui/sonner";
import {
  useAccount,
  useCancelSubscriptionMutation,
  useChangePasswordMutation,
  usePortalMutation,
} from "@/features/account/hooks";
import { useSettings } from "@/features/settings/hooks";

const statusVariant: Record<SubscriptionStatus, "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  trialing: "warning",
  past_due: "destructive",
  canceled: "secondary",
};

const statusLabel: Record<SubscriptionStatus, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Past due",
  canceled: "Canceled",
};

function formatPence(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

export function AccountPage() {
  const accountQuery = useAccount();
  const settingsQuery = useSettings();
  const portalMutation = usePortalMutation();
  const cancelMutation = useCancelSubscriptionMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (accountQuery.isLoading || settingsQuery.isLoading) return <LoadingState rows={4} />;

  if (accountQuery.isError) {
    return (
      <ErrorState
        title="Account unavailable"
        description="Could not load your account information. Please try again."
        onRetry={() => accountQuery.refetch()}
      />
    );
  }

  if (!accountQuery.data) return <LoadingState rows={3} />;

  const { user, subscription } = accountQuery.data;
  const activePropertyCount = settingsQuery.data?.properties.filter((p) => p.status === "ACTIVE").length ?? 0;
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  const handleCancel = async () => {
    await cancelMutation.mutateAsync();
    setShowCancelDialog(false);
    toast.success("Subscription cancelled");
  };

  const openPasswordDialog = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError(null);
    setShowPasswordDialog(true);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    try {
      await changePasswordMutation.mutateAsync(passwordForm);
      setShowPasswordDialog(false);
      toast.success("Password changed successfully");
    } catch {
      setPasswordError("Current password is incorrect. Please try again.");
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">My account</h1>
        <p className="text-sm text-muted-foreground">Your profile and subscription details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-base font-semibold text-white">
              {initials}
            </div>
            <div className="grid gap-0.5">
              <p className="text-sm font-semibold text-slate-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="grid gap-0.5">
              <p className="text-sm font-medium text-slate-900">Password</p>
              <p className="text-xs text-muted-foreground">Change your account password</p>
            </div>
            <Button variant="outline" size="sm" onClick={openPasswordDialog}>
              <KeyRound className="mr-2 h-3.5 w-3.5" />
              Change password
            </Button>
          </div>
        </CardContent>
      </Card>

      {subscription ? (
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Your current plan and property usage.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{subscription.planName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPence(subscription.pricePerProperty)} per property / {subscription.billingCycle}
                </p>
              </div>
              <Badge variant={statusVariant[subscription.status]}>
                {statusLabel[subscription.status]}
              </Badge>
            </div>

            <div className="grid gap-3 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">Properties used</span>
                <span className="font-semibold text-slate-900">
                  {activePropertyCount} / {subscription.maxProperties}
                </span>
              </div>
              <PropertyUsageBar used={activePropertyCount} max={subscription.maxProperties} />
              <p className="text-xs text-muted-foreground">
                {subscription.maxProperties - activePropertyCount} property slot
                {subscription.maxProperties - activePropertyCount !== 1 ? "s" : ""} remaining
              </p>
            </div>

            {subscription.currentPeriodEnd ? (
              <div className="grid gap-1 rounded-lg border p-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {subscription.status === "canceled" ? "Access until" : "Renewal date"}
                </span>
                <span className="text-sm text-slate-900">{formatDate(subscription.currentPeriodEnd)}</span>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {portalMutation.isPending ? "Opening..." : "Manage subscription"}
              </Button>
              {subscription.status !== "canceled" ? (
                <Button
                  variant="outline"
                  className="text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel subscription
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>No active subscription found.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Current password</span>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  autoComplete="current-password"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">New password</span>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Confirm new password</span>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </label>
              {passwordError ? (
                <p className="text-sm text-red-600">{passwordError}</p>
              ) : null}
            </div>
          </DialogBody>
          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? "Saving..." : "Change password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel subscription?</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-slate-700">
              Your subscription will remain active until the end of the current billing period
              {subscription?.currentPeriodEnd ? ` (${formatDate(subscription.currentPeriodEnd)})` : ""}.
              After that, you will lose access to the dashboard.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">This action cannot be undone.</p>
          </DialogBody>
          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Yes, cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PropertyUsageBar({ used, max }: { used: number; max: number }) {
  const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0;
  const isNearLimit = pct >= 80;
  const isAtLimit = used >= max;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all ${isAtLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-emerald-500"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
