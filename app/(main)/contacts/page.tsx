export const dynamic = "force-dynamic";

import { getAccounts } from "../../../actions/account.action";
import { getCategories } from "../../../actions/categories.action";
import { getContacts } from "../../../actions/contact.action";
import { getDbUserId } from "../../../actions/user.action";
import ContactsPageClient from "./_components/ContactsPageClient";

const ContactsPage = async () => {
  const dbUserId = await getDbUserId();
  if (!dbUserId) return;
  let categories = await getCategories();
  categories = categories?.filter((cat) => cat.type === "EXPENSE");
  const accounts = await getAccounts();
  const contacts = await getContacts();

  console.log("Contacts", contacts);

  return (
    <ContactsPageClient
      dbUserId={dbUserId}
      categories={categories}
      accounts={accounts}
      contacts={contacts}
    />
  );
};

export default ContactsPage;
