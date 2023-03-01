// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { SchemaEncoder, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { SAMPLE } from "src/constants/SAMPLE";
import { ethers } from "ethers";
import { AttestationResponse, AttestationData } from "src/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AttestationResponse>,
) {
  // const endpoint =
  //  `${process.env.ENDPOINT}`?page=1";
  // const response = await fetch(endpoint, {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Access-Control-Allow-Origin": "*",
  //     "Access-Control-Allow-Methods": "GET,POST,OPTIONS,DELETE,PUT",
  //   },
  // });
  // const EASContractAddress = "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458"; // Arbitrum
  const schemaRegistryAddress = '0xA310da9c5B885E7fb3fbA9D66E9Ba6Df512b78eB'; // Arbitrum
  // // Initialize the sdk with the address of the EAS Schema contract address
  const provider = new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');

  const schemaRegistry = new SchemaRegistry(schemaRegistryAddress, provider);
  const schema = await schemaRegistry.getSchema({uid: '0x951fa7e07d6e852eb4535331db373786f5ab7249bb31d94cc4bd05250ebb6500'})

  const schemaEncoder = new SchemaEncoder(schema.schema);

  const votes: AttestationResponse = {}

  for(const attestation of SAMPLE.attestations) {
    const decodedData = schemaEncoder.decodeData(attestation.data);
    const values = decodedData[3].value
    if (!Array.isArray(values.value)) continue

    for(const value of values.value) {
      const projectName = value[0]['value']
      const voteCount = value[1]['value']
      if (typeof projectName !== 'string' || typeof voteCount !== 'number') continue

      if (!(projectName in votes)) {
        votes[projectName] = {
          votes: [],
          score: 0,
          attestations: []
        }
      }

      votes[projectName].votes.push(voteCount)
      votes[projectName].score = Math.pow(votes[projectName].votes.reduce((a, b) => Math.sqrt(a) + Math.sqrt(b), 0), 2)
      votes[projectName].attestations.push(attestation)
    }
  }
  
  res.status(200).json(votes)
}
