import styled from "styled-components";
import { fetchPlatformConfig } from "@/lib/platform-config";
import { BrandingForm } from "@/components/admin/BrandingForm";
import { TextsForm } from "@/components/admin/TextsForm";

const Page = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
`;

export default async function PlatformConfigPage() {
  const config = await fetchPlatformConfig();

  return (
    <Page>
      <Header>
        <Title>Configurações da plataforma</Title>
        <Subtitle>Personalize a identidade e os textos exibidos para os visitantes.</Subtitle>
      </Header>

      <Section>
        <SectionTitle>Identidade</SectionTitle>
        <BrandingForm config={config} />
      </Section>

      <Section>
        <SectionTitle>Textos</SectionTitle>
        <TextsForm config={config} />
      </Section>
    </Page>
  );
}
