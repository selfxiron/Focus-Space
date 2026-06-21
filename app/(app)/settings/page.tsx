import { ExportDataCard } from "@/components/settings/export-data-card";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { SignOutButton } from "@/components/settings/sign-out-button";
import { SchemaSetupRequired } from "@/components/setup/schema-setup-required";
import { requireUser } from "@/lib/auth/require-user";
import { SchemaNotReadyError } from "@/lib/db/schema-error";
import { getUserSettings } from "@/lib/data/user-settings";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  try {
    const user = await requireUser();
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    const settings = await getUserSettings(user.id);

    return (
      <div className="mx-auto max-w-[560px] space-y-6">
        <PreferencesForm initialSettings={settings} />
        <ExportDataCard />
        <SignOutButton
          userEmail={authUser?.email}
          userName={authUser?.user_metadata?.full_name}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof SchemaNotReadyError) {
      return <SchemaSetupRequired />;
    }
    throw error;
  }
}
