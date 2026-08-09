export type JumpNavigationItem = {
  label?: string
  href?: string
  id?: string
}

export const resolveJumpNavigation = (
  items: JumpNavigationItem[],
  orderedTargets: string[],
) => {
  const positions = new Map<string, number>()

  orderedTargets.forEach((target) => {
    if (target && !positions.has(target)) positions.set(target, positions.size)
  })

  return items
    .map((item, index) => {
      const target = item.href ?? (item.id ? `#${item.id}` : '')
      return {
        item,
        index,
        position: positions.get(target) ?? Number.MAX_SAFE_INTEGER,
      }
    })
    .sort((a, b) => a.position - b.position || a.index - b.index)
    .map(entry => entry.item)
}
