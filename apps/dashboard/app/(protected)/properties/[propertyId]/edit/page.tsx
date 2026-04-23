import { PropertyEditPage } from "@/features/properties/PropertyEditPage";

export default async function PropertyEditRoute({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  return <PropertyEditPage propertyId={propertyId} />;
}
