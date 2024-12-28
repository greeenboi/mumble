import { Container } from '~/components/Container';
import { Text } from '~/components/ui/text';
import { useUser } from '~/hooks/useUser';

export default function Settings() {
  const { email, isAuthenticated, user } = useUser();

  return (
    <Container>
      <Text>{email}</Text>
      <Text>{isAuthenticated}</Text>
      <Text>{user?.role}</Text>
    </Container>
  );
}
