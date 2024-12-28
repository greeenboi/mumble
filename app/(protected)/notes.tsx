import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import { useUser } from '~/hooks/useUser';

export default function Details() {
  const { email } = useUser();

  return (
    <Container>
      <ScreenContent path="screens/details.tsx" title={`Showing details for user ${email}`} />
    </Container>
  );
}
