// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
  SchemaEncoder,
  SchemaRegistry,
} from "@ethereum-attestation-service/eas-sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { AttestationResponse } from "src/types";
import ATTESTATION from "src/constants/ATTESTATION";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AttestationResponse>,
) {
  try {
    const attestations: (typeof ATTESTATION)[] = [];
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
        attestations.push(...data["attestations"]);
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

    const votes: AttestationResponse["value"] = {};

    for (const attestation of attestations) {
      const decodedData = schemaEncoder.decodeData(attestation.data);
      const values = decodedData[3].value;
      if (!Array.isArray(values.value)) continue;

      for (const value of values.value) {
        const slug = value[0]["value"];
        const voteCount = value[1]["value"];
        if (typeof slug !== "string" || typeof voteCount !== "number") continue;

        if (!(slug in votes)) {
          votes[slug] = {
            votes: [],
            score: 0,
            // attestations: []
          };
        }

        votes[slug].votes.push(voteCount);
        // votes[slug].attestations.push(attestation);
      }
    }

    for (const slug in votes) {
      votes[slug].score = Math.pow(
        votes[slug].votes.reduce((a, b) => a + Math.sqrt(b), 0),
        2,
      );

      // votes[slug].attestations.sort((a, b) => {
      //   return parseInt(b.time) - parseInt(a.time)
      // })
    }

    res.status(200).json({ value: votes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: JSON.stringify(e) });
  }
}
