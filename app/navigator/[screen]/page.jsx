import Navigator from "../../../components/Navigator.jsx";
import { screens } from "../../../lib/content.js";
export const dynamicParams = false;
export function generateStaticParams() {
  return screens.map((screen) => ({ screen }));
}
export default async function Page({ params }) {
  const { screen } = await params;
  return <Navigator initialScreen={screen} />;
}
