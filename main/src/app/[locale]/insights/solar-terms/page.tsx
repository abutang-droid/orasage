import { buildPillarPage } from '@/lib/insights-pillar';

const { generateMetadata, Page } = buildPillarPage('solar-terms');
export { generateMetadata };
export default Page;
