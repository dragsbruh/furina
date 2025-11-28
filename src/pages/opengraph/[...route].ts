import { OGImageRoute } from "astro-og-canvas";
import { getCollection } from "astro:content";

const collectionEntries = await getCollection("blog");
const pages = Object.fromEntries(
  collectionEntries.map(({ data }) => [data.slug, data])
);

export const { getStaticPaths, GET } = OGImageRoute({
  param: "route",

  pages: pages,

  getImageOptions: (path, page) => {
    return {
      title: page.title,
      description: page.description,

      border: {
        color: [87, 102, 185],
        width: 12,
      },

      bgGradient: [
        [20, 24, 49],
        [30, 27, 44],
      ],
      logo: {
        path: "./public/avatar.png",
        size: [128, 128],
      },
      padding: 40,
    };
  },
});
