import React, { type ComponentPropsWithoutRef, type ElementType } from 'react'
import { useTranslation } from 'react-i18next'

type TranslateProps<T extends ElementType = 'span', K extends string = string> = {
  /** Translation key (e.g. "brand.tagline") */
  tid: K
  as?: T
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'children'>

/**
 * Renders a translation by key. All user-visible text should go through this component or useTranslation.
 */
export function Translate<T extends ElementType = 'span', K extends string = string>({
  tid,
  as: Component = 'span' as T,
  className,
  ...rest
}: TranslateProps<T, K>) {
  const { t, i18n } = useTranslation()
  const text = t(tid)
  const Comp = Component as React.ElementType
  return (
    <Comp className={className} lang={i18n.language} {...(rest as Record<string, unknown>)}>
      {text}
    </Comp>
  )
}
