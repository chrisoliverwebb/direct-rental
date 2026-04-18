import { ContactDetailPage } from "@/features/contacts/ContactDetailPage";

export default async function ContactDetailRoute({ params }: { params: Promise<{ contactId: string }> }) {
  const { contactId } = await params;
  return <ContactDetailPage contactId={contactId} />;
}
