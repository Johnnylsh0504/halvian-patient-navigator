import Navigator from "../../../components/Navigator.jsx";
import { screens } from "../../../lib/content.js";

export const dynamicParams = false;
export const metadata = {
  title: "Halvian | Patient Experience",
  description: "Emergency department patient experience.",
};

export function generateStaticParams() {
  return screens.map((screen) => ({ screen }));
}

export default async function PatientPage({ params }) {
  const { screen } = await params;
  return <Navigator initialScreen={screen} />;
}
