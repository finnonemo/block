import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge"

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'large-title',
            'title-1',
            'title-2',
            'title-3',
            'headline',
            'body',
            'callout',
            'subhead',
            'footnote',
            'caption-1',
            'caption-2'
          ]
        }
      ]
    }
  }
})

export function cn(...inputs) {
  return customTwMerge(clsx(inputs));
}

