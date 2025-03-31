import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';

import { Container } from '@/components/Container';
import { ScreenContent } from '@/components/ScreenContent';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function IndexUnusedPage() {
  return (
    <Container>
      <ScreenContent title="Welcome to Expo Router" path="app/index.tsx" />
      <Button variant="destructive" size="sm" className="flex-row items-center gap-2">
        <Text>
          {' '}
          <Ionicons name="log-out" className="text-primary-foreground" /> Sign Out
        </Text>
      </Button>
      <Link href="/sign-in" asChild>
        <Button variant="ghost" size="sm" className="flex-row items-center gap-2">
          <Text>Sign In</Text>
        </Button>
      </Link>
    </Container>
  );
}
