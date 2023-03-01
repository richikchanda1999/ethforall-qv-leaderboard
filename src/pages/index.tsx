import { useEffect, useState } from "react";
import { Flex, Text } from "@chakra-ui/react";

export default function Home() {
  const decode = async () => {
    const data = await fetch("/api/attestations");
    if (data.status === 200) {
      const json = await data.json();
      const votes: {name: string, votes: number}[] = [];
      for(const slug in json) {
        votes.push({name: slug, votes: json[slug]})
      }
      setVotes(votes.sort((a, b) => b.votes - a.votes));
    }
  };

  useEffect(() => {
    decode();
  }, []);

  const [votes, setVotes] = useState<{name: string, votes: number}[]>([]);

  return (
    <Flex direction={'column'}>
     <Text>
     Leaderboard
     </Text>
      <Flex direction='column'>
        {
          votes.map((vote, index) => {
            return <Flex m={4} p={4} key={vote.name} bg='gray.200'>
              <Text>{vote.name}</Text>
              <Text ml={2}>{vote.votes}</Text>
            </Flex>
          })
        }
      </Flex>
    </Flex>
  );
}
