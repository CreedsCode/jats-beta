import { Box, Heading, Text, Button } from "@chakra-ui/react";

const AccessDenied = () => {
  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      backgroundColor="gray.100"
    >
      <Heading as="h1" size="2xl" mb={5}>
        Access Denied
      </Heading>
      <Text fontSize="xl" mb={10}>
        You do not have permission to view this page.
      </Text>
      <Button as="a" href="/" colorScheme="teal" size="lg">
        Go Back
      </Button>
    </Box>
  );
};

export default AccessDenied;
