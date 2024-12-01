

type ProjectedApplication<O, T extends Record<string, 1>> = T extends { [K in infer Key]?: 1; } ?
    Key extends `${infer Prefix}.${infer Suffix}` ?
    Prefix extends keyof O ? Suffix extends keyof ProjectedApplication<O[Prefix], { [P in Prefix]: 1 }> ? { [P in Prefix]: ProjectedApplication<O[Prefix], { [K in Suffix]: 1 }> } : never : never :
    Key extends keyof O ? { [K in Key]: O[Key] } : never
    : never;



type UnionToIntersection<U> =
    (U extends any ? (k: U) => void : never) extends
    ((k: infer I) => void) ? I : never

export type ProjectionType<K, T extends Record<string, 1>> = UnionToIntersection<ProjectedApplication<K, T>>



