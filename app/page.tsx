import { redirect } from "next/navigation";
import { UsersScreen } from "./components/screen/Users";
import { NotificationBell } from "./components/NotificationBell";
import { getGoogleSession } from "@/lib/google-auth";
import { fetchHubSpotContacts } from "@/lib/hubspot-contacts";

const fetchUsers = async () => {
  const result = await fetchHubSpotContacts();

  if (!result.ok) {
    return {
      status: result.status,
      contacts: [],
      error: result.error,
    };
  }

  return {
    status: 200,
    contacts: result.results,
    error: null,
  };
};

export default async function Home() {
  const googleSession = await getGoogleSession();

  if (!googleSession) {
    redirect("/login");
  }

  const data = await fetchUsers();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 px-8 py-4 dark:border-zinc-800">
        <p className="text-sm font-medium">Library CRM</p>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <p className="text-sm text-zinc-500">{googleSession.email}</p>
          <a
            href="/api/auth/logout"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Log out
          </a>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-8 py-10">
        <UsersScreen contacts={data.contacts} error={data.error} />
      </main>
    </div>
  );
}
