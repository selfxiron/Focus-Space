import { SignOutButton } from "@/components/settings/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-[480px] space-y-6">
      <SignOutButton
        userEmail={user?.email}
        userName={user?.user_metadata?.full_name}
      />
      <p className="text-sm text-muted-foreground">
        More preferences (timezone, Pomodoro defaults) coming in a future
        update.
      </p>
    </div>
  );
}
