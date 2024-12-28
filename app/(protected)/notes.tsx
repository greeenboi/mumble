import { Container } from '~/components/Container';
import { H1 } from '~/components/ui/typography';
import { useUser } from '~/hooks/useUser';

export default function Details() {
  const { email } = useUser();

  return (
    <Container>
      <H1>Details</H1>
    </Container>
  );
}
