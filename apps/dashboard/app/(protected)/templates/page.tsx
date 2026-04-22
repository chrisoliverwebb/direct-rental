import { redirect } from "next/navigation";

export default function TemplatesRoute() {
  redirect("/campaigns?tab=templates");
}
