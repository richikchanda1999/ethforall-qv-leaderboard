import { useEffect, useState } from "react";
import { Flex, Text, Image } from "@chakra-ui/react";
import { AttestationData, AttestationResponse, ProjectData } from "src/types";
import PROJECTS from "src/constants/PROJECTS";

type Project = { slug: string } & ProjectData & AttestationData;

export default function Home() {
  const decode = async () => {
    const attestationData = await fetch("/api/attestations");
    if (attestationData.status === 200) {
      const json: AttestationResponse = await attestationData.json();
      const votes: Project[] = [];
      for (const slug in json) {
        const project = PROJECTS[slug];
        votes.push({ slug, ...project, ...json[slug] });
      }
      setProjects(votes.sort((a, b) => b.score - a.score));
    }
  };

  useEffect(() => {
    decode();
  }, []);

  const [projects, setProjects] = useState<Project[]>([]);

  return (
    <Flex direction={"column"} align="center" p={6} h="100vh">
      <Text fontSize="4rem">Leaderboard</Text>
      <Flex direction="column" overflowY={"scroll"} mt={4}>
        {projects.map((project, index) => {
          return (
            <Flex
              m={4}
              p={6}
              key={project.slug}
              boxShadow="0 1px 25px rgba(0,0,0,0.2)"
              borderRadius={"1rem"}
              align="center"
              direction={["column", "row"]}
              cursor='pointer'
              onClick={() => window.open(`https://devfolio.co/projects/${project.slug}`, '_blank')}
            >
             
                <Image
                  src={project.image === null ? `https://avatars.dicebear.com/api/initials/${project.name}.svg?fontSize=32` : project.image}
                  borderRadius="0.5rem"
                  boxSize={["5rem", "4rem"]}
                  alt={project.slug}
                />
              
              <Flex w='100%' justify='space-between' align='center' direction={['column', 'row']} mt={[4, 0]} ml={[0, 4]}>
                <Flex direction="column" gap={1} >
                  <Flex
                    gap={4}
                    justify={["space-between", "start"]}
                    align='baseline'
                  >
                    <Text fontSize='18px'>{project.name}</Text>
                    <Text color="gray">
                      {project.attestations.length} attestations
                    </Text>
                  </Flex>
                  <Text color="gray.500" textAlign={'justify'}>{project.tagline}</Text>
                </Flex>
                <Flex direction='column' align='end' ml={"auto"} gap={1}>
                  <Text fontSize='18px'>Score: {project.score.toFixed(2)}</Text>
                  <Text fontSize='18px'>
                    Total votes: {project.votes.reduce((a, b) => a + b, 0)}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
