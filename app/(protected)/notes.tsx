import React from 'react';
import { View } from 'react-native';

import { Container } from '~/components/Container';
// import { RecordingCard } from '~/components/audio/RecordingCard';
import { H1 } from '~/components/ui/typography';

export default function Notes() {
  return (
    <Container>
      <H1 className="mb-6">Voice Notes</H1>
      <View className="w-full">{/* <RecordingCard /> */}</View>
    </Container>
  );
}
