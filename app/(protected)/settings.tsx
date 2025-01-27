import { Container } from '~/components/Container';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { UseSignOut } from '~/hooks/useSignOut';
import { useUser } from '~/hooks/useUser';
import { Logout } from '~/lib/icons/Logout';

export default function Settings() {
  const { email, isAuthenticated, user } = useUser();
  const signOut = UseSignOut();
  return (
    <Container>
      <Text>{email}</Text>
      <Text>{isAuthenticated}</Text>
      <Text>{user?.role}</Text>
      <Button
        variant="destructive"
        size="sm"
        onPress={signOut}
        className="flex-row items-center gap-2">
        <Logout className="text-primary-foreground" /> <Text>Sign Out</Text>
      </Button>
    </Container>
  );
}
