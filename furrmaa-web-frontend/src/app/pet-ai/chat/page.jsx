import Container from '@/components/Container';
import PetAIChat from '@/components/PetAIChat';

export const metadata = {
  title: 'Pet AI Chat | Furrmaa',
  description: 'ChatGPT-powered pet care assistant',
};

export default function PetAIChatPage() {
  return (
    <section className="py-8 px-4 bg-white min-h-[80vh]">
      <Container>
        <PetAIChat />
      </Container>
    </section>
  );
}
