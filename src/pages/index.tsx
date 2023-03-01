import { useEffect, useState } from "react";
import { Flex, Text, Image, Input } from "@chakra-ui/react";
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
  const [searchText, setSearchText] = useState<string>("");

  return (
    <Flex direction={"column"} align="center" p={6} h="100vh" gap={4}>
      <Flex
        direction={{ base: "column", md: "row" }}
        align="center"
        justify="center"
        gap={4}
      >
        <Text fontSize={{base: "2rem", sm: '3rem', lg: "4rem"}} textAlign='center'>Quadratic Voting</Text>
        <Text fontSize={{base: "2rem", sm: '3rem', lg: "4rem"}} textAlign='center'>Leaderboard</Text>
      </Flex>

      <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder='Search for projects by name' p={2} />

      <Flex direction="column" overflowY={"scroll"} w='100%'>
        {projects.filter(p => searchText === '' || p.name.toLowerCase().includes(searchText.toLowerCase())).map((project, index) => {
          return (
            <Flex
              m={4}
              p={6}
              key={project.slug}
              boxShadow="0 1px 25px rgba(0,0,0,0.2)"
              borderRadius={"1rem"}
              align="center"
              direction={{ base: "column", md: "row" }}
              cursor="pointer"
              onClick={() =>
                window.open(
                  `https://devfolio.co/projects/${project.slug}`,
                  "_blank",
                )
              }
            >
              <Image
                src={
                  project.image === null
                    ? `https://avatars.dicebear.com/api/initials/${project.name}.svg?fontSize=32`
                    : project.image
                }
                borderRadius="0.5rem"
                boxSize={{ base: "5rem", md: "4rem" }}
                alt={project.slug}
              />

              <Flex
                w="100%"
                justify="space-between"
                align="center"
                direction={{ base: "column", md: "row" }}
                mt={{ base: 4, md: 0 }}
                ml={{ base: 0, md: 4 }}
              >
                <Flex
                  w={{ base: "100%", md: "auto" }}
                  direction="column"
                  gap={1}
                >
                  <Flex
                    gap={4}
                    justify={{ base: "space-between", md: "start" }}
                    align="baseline"
                  >
                    <Text fontSize="18px">{project.name}</Text>
                    <Text color="gray">
                      {project.attestations.length} attestation
                      {project.attestations.length > 0 ? "s" : ""}
                    </Text>
                  </Flex>
                  <Text color="gray.500" textAlign={"justify"}>
                    {project.tagline}
                  </Text>
                </Flex>
                <Flex
                  w={{ base: "100%", md: "auto" }}
                  direction={{ base: "row", lg: "column" }}
                  align="end"
                  justify={{ base: "space-between", lg: "center" }}
                  gap={1}
                  ml={{ base: 0, md: 4 }}
                  mt={{ base: 4, md: 0 }}
                >
                  <Text fontSize="18px">Score: {project.score.toFixed(2)}</Text>
                  <Text fontSize="18px">
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
