import { collectSearchTargets } from './collectSearchTargets'
import { comparePartialTargets, getSearchTargetRank } from './compareSearchTargets'
import type { QnaSearchSpace, SearchTarget } from './types'
import type { WordRelation } from '../../relation/types'

interface RelationMatch {
  relation: WordRelation
  target: SearchTarget
}

export function computeExactMatches(space: QnaSearchSpace, query: string): WordRelation[] {
  const matches = collectMatches(space, (targets) => findBestExactTarget(targets, query))
  matches.sort(
    (a, b) =>
      getSearchTargetRank(a.target) - getSearchTargetRank(b.target) || compareRecency(a, b),
  )
  return matches.map((match) => match.relation)
}

export function computePartialMatches(space: QnaSearchSpace, query: string): WordRelation[] {
  const matches = collectMatches(space, (targets) => {
    if (findBestExactTarget(targets, query)) {
      return null
    }
    return findBestPartialTarget(targets, query)
  })
  matches.sort((a, b) => comparePartialTargets(a.target, b.target) || compareRecency(a, b))
  return matches.map((match) => match.relation)
}

function collectMatches(
  space: QnaSearchSpace,
  findTarget: (targets: SearchTarget[]) => SearchTarget | null,
): RelationMatch[] {
  const matches: RelationMatch[] = []
  for (const relation of space.relations) {
    const targets = collectSearchTargets(relation, space.wordMap, space.sentenceMap)
    const target = findTarget(targets)
    if (target) {
      matches.push({ relation, target })
    }
  }
  return matches
}

function findBestExactTarget(targets: SearchTarget[], query: string): SearchTarget | null {
  return selectBestTarget(
    targets.filter((target) => target.value === query),
    (a, b) => getSearchTargetRank(a) - getSearchTargetRank(b),
  )
}

function findBestPartialTarget(targets: SearchTarget[], query: string): SearchTarget | null {
  return selectBestTarget(
    targets.filter((target) => target.value.includes(query)),
    comparePartialTargets,
  )
}

function selectBestTarget(
  targets: SearchTarget[],
  compare: (a: SearchTarget, b: SearchTarget) => number,
): SearchTarget | null {
  if (!targets.length) {
    return null
  }
  return targets.reduce((best, target) => (compare(target, best) < 0 ? target : best))
}

function compareRecency(a: RelationMatch, b: RelationMatch): number {
  return (
    b.relation.createdAt.getTime() - a.relation.createdAt.getTime() ||
    b.relation.relationId - a.relation.relationId
  )
}
