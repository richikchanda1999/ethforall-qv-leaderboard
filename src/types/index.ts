export type ProjectData = {name: string, image: string | null, tagline: string}
export type ProjectResponse = {[key: string]: ProjectData}
export type AttestationData = {votes: number[], score: number, attestations: {uid: string, time: string}[]}
export type AttestationResponse = {value?: {[key: string]: AttestationData}, error?: string}