import { SAMPLE } from "src/constants/SAMPLE";

export type ProjectData = {name: string, image: string | null, tagline: string}
export type ProjectResponse = {[key: string]: ProjectData}
export type AttestationData = {votes: number[], score: number, attestations: typeof SAMPLE.attestations}
export type AttestationResponse = {[key: string]: AttestationData}