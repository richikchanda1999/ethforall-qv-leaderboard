import { useEffect, useState } from "react";
import {
  Flex,
  Text,
  Image,
  Input,
  CircularProgress,
  Popover,
  PopoverTrigger,
  PopoverBody,
  Link,
  Button,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
} from "@chakra-ui/react";
import { AttestationData, AttestationResponse, ProjectData } from "src/types";
import PROJECTS from "src/constants/PROJECTS";
import moment from "moment";

type Project = { slug: string } & ProjectData & AttestationData;

export default function Home() {
  const decode = async () => {
    const attestationData = await fetch("/api/attestations");
    if (attestationData.status === 200) {
      const json: AttestationResponse = await attestationData.json();
      if (json.value) {
        const votes: Project[] = [];
        for (const slug in PROJECTS) {
          votes.push({ slug, ...PROJECTS[slug], ...json.value[slug] });
        }
        setProjects(votes.sort((a, b) => b.score - a.score));
      }
    }
    setIsLoading(false);
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    if (isLoading) return;
    setIsLoading(true);
    decode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatUID = (uid: string) => uid ?
    `${uid.substring(0, 4)}....${uid.substring(uid.length - 4)}` : '';

  return (
    <Flex direction={"column"} align="center" p={6} h="100vh" gap={4}>
      <Flex
        direction={{ base: "column", md: "row" }}
        align="center"
        justify="center"
        gap={4}
      >
        <Text
          fontSize={{ base: "2rem", sm: "3rem", lg: "4rem" }}
          textAlign="center"
        >
          Quadratic Voting
        </Text>
        <Text
          fontSize={{ base: "2rem", sm: "3rem", lg: "4rem" }}
          textAlign="center"
        >
          Leaderboard
        </Text>
      </Flex>

      <Input
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search for projects by name"
        p={2}
      />

      {isLoading && <CircularProgress isIndeterminate />}

      {!isLoading && (
        <Flex direction="column" overflowY={"scroll"} w="100%">
          {projects
            .filter(
              (p) =>
                searchText === "" ||
                p.name.toLowerCase().includes(searchText.toLowerCase()),
            )
            .map((project, index) => {
              return (
                <Flex
                  m={4}
                  p={6}
                  key={project.slug}
                  boxShadow="0 1px 25px rgba(0,0,0,0.2)"
                  borderRadius={"1rem"}
                  align="center"
                  direction={{ base: "column", md: "row" }}
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
                        <Text
                          fontSize="18px"
                          _hover={{ textDecoration: "underline" }}
                          cursor="pointer"
                          onClick={() =>
                            window.open(
                              `https://devfolio.co/projects/${project.slug}`,
                              "_blank",
                            )
                          }
                        >
                          {project.name}
                        </Text>
                        <Popover trigger="hover" isLazy>
                          <PopoverTrigger>
                            <Button variant={"unstyled"} color="gray">
                              {project.attestations?.length || 0} attestation
                              {(project.attestations?.length || 0) > 0
                                ? "s"
                                : ""}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent h={"40vh"}>
                            <PopoverArrow />
                            <PopoverHeader>
                              {project.attestations?.length || 0} Attestation
                              {(project.attestations?.length || 0) > 0
                                ? "s"
                                : ""}
                            </PopoverHeader>
                            <Flex
                              direction="column"
                              w="100%"
                              h="100%"
                              overflowY={"scroll"}
                            >
                              {project.attestations?.map(
                                (attestation, index) => {
                                  return (
                                    <Flex key={index} direction="column" m={4} p={4} gap={1} borderBottom={index !== project?.attestations.length - 1 ? '1px solid #E4E4E4' : 'none'}>
                                      <Link
                                        href={`https://arbitrum.easscan.org/attestation/view/${attestation.id}`}
                                        isExternal
                                      >
                                        {formatUID(attestation.id)}
                                      </Link>
                                      <Text color='gray.500'>
                                        Attested at {moment.unix(parseInt(attestation.time)).format('DD MMM')}
                                      </Text>
                                    </Flex>
                                  );
                                },
                              )}
                            </Flex>
                          </PopoverContent>
                        </Popover>
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
                      <Text fontSize="18px">
                        Score: {project.score ? project.score.toFixed(2) : 0}
                      </Text>
                      <Text fontSize="18px">
                        Total votes: {project.votes?.reduce((a, b) => a + b, 0)}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              );
            })}
        </Flex>
      )}
    </Flex>
  );
}
