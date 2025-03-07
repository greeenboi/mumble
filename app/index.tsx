import Ionicons from '@expo/vector-icons/Ionicons';

import { Container } from '~/components/Container';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export default function IndexUnusedPage() {
  return (
    <Container>
      <Button variant="destructive" size="sm" className="flex-row items-center gap-2">
        <Text>
          {' '}
          <Ionicons name="log-out" className="text-primary-foreground" /> Sign Out
        </Text>
      </Button>
    </Container>
  );
}
