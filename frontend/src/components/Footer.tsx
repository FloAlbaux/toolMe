import { Translate } from './Translate'

export function Footer() {
  return (
    <footer
      className="mt-auto border-t border-stone-200 bg-white py-6"
      role="contentinfo"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Translate
          tid="footer.tagline"
          as="p"
          className="text-sm text-stone-500"
        />
      </div>
    </footer>
  )
}
