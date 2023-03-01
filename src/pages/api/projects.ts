import type { NextApiRequest, NextApiResponse } from "next";
import { ProjectData, ProjectResponse } from "src/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProjectResponse>,
) {
    if (!process.env.DEVFOLIO_ENDPOINT) {
        res.status(500).json({})
        return
    }

  const endpoint = process.env.DEVFOLIO_ENDPOINT;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS,DELETE,PUT",
    },
    body: JSON.stringify({
        "hackathon_slugs": [
            "ethforall"
        ],
        "q": "",
        "filter": "all",
        "prizes": [],
        "prize_tracks": [],
        "hashtags": [],
        "from": 0,
        "size": 450,
    })
  });

  const { hits: {hits} } = await response.json();
  
  const ret: ProjectResponse = {}
  for(const hit of hits) {
    const key = hit._source.slug
    if (typeof key !== 'string') continue

    ret[key] = {name: hit._source.name, image: hit._source.favicon, tagline: hit._source.tagline}
  }
  
  res.status(200).json(ret)
}
