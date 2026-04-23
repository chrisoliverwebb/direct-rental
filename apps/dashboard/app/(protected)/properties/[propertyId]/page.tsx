import { PropertyDetailPage } from "@/features/properties/PropertyDetailPage";

export default async function PropertyDetailRoute({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  return <PropertyDetailPage propertyId={propertyId} />;
}
