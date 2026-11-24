import Hospital from "../../../components/Hospital.jsx";
import { hospitalWorkspaces } from "../../../lib/content.js";

export const dynamicParams = false;
export const metadata = {
  title: "Halvian | Hospital Workspace",
  description: "Emergency department hospital operations workspace.",
};

export function generateStaticParams() {
  return hospitalWorkspaces.map((workspace) => ({ workspace }));
}

export default async function HospitalPage({ params }) {
  const { workspace } = await params;
  return <Hospital workspace={workspace} />;
}
