// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
  Attestation,
  SchemaEncoder,
  SchemaRegistry,
} from "@ethereum-attestation-service/eas-sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { AttestationResponse } from "src/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AttestationResponse>,
) {
  try {
    const attestations: Attestation[] = [];
    for (let i = 1; ; ++i) {
      const endpoint = `${process.env.EAS_ENDPOINT}?page=${i}`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS,DELETE,PUT",
        },
      });
      if (response.status === 200) {
        const data = await response.json();
        if (data.attestations.length === 0) break;
        attestations.push(...data['attestations']);
      }
    }

    const schemaRegistryAddress = "0xA310da9c5B885E7fb3fbA9D66E9Ba6Df512b78eB"; // Arbitrum
    const provider = new ethers.providers.JsonRpcProvider(
      "https://arb1.arbitrum.io/rpc",
    );

    const schemaRegistry = new SchemaRegistry(schemaRegistryAddress, provider);
    const schema = await schemaRegistry.getSchema({
      uid: "0x951fa7e07d6e852eb4535331db373786f5ab7249bb31d94cc4bd05250ebb6500",
    });

    const schemaEncoder = new SchemaEncoder(schema.schema);

    const votes: AttestationResponse['value'] = {};

    for (const attestation of attestations) {
      const decodedData = schemaEncoder.decodeData(attestation.data);
      const values = decodedData[3].value;
      if (!Array.isArray(values.value)) continue;

      for (const value of values.value) {
        const projectName = value[0]["value"];
        const voteCount = value[1]["value"];
        if (typeof projectName !== "string" || typeof voteCount !== "number")
          continue;

        if (!(projectName in votes)) {
          votes[projectName] = {
            votes: [],
            score: 0,
            attestations: [],
          };
        }

        votes[projectName].votes.push(voteCount);
        votes[projectName].score = Math.pow(
          votes[projectName].votes.reduce(
            (a, b) => Math.sqrt(a) + Math.sqrt(b),
            0,
          ),
          2,
        );
        votes[projectName].attestations?.push(attestation);
      }
    }

    res.status(200).json({value: votes});
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
