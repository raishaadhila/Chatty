import { Section } from '../shared/ui';

const logos = ['Tokopedia', 'Shopee', 'Gojek', 'Traveloka', 'Bukalapak', 'Blibli'];

export default function SocialProof() {
  return (
    <Section dark>
      <p className="text-center text-text-secondary mb-8 font-medium">Trusted by 100+ businesses across Indonesia</p>
      <div className="flex flex-wrap justify-center gap-8 md:gap-16">
        {logos.map(name => (
          <div key={name} className="text-text-muted/40 hover:text-text-muted/80 text-lg font-bold tracking-wider transition-colors uppercase select-none">
            {name}
          </div>
        ))}
      </div>
    </Section>
  );
}
