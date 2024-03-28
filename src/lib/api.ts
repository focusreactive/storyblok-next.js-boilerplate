import { SB_CACHE_VERSION } from "@/constants/cacheTags";
import {
  getStoryblokApi,
  ISbStoriesParams,
  ISbStoryData,
} from "@storyblok/react/rsc";

const API_GATE = process.env.NEXT_PUBLIC_API_GATE;

// Get the actual SB cache version
const getSbCacheCvParameter = async (isDraftMode: boolean) => {
  const searchParamsData: ISbStoriesParams = {
    token: process.env.SB_PREVIEW_TOKEN,
    version: isDraftMode ? "draft" : "published",
    per_page: 1,
  };

  const searchParams = new URLSearchParams(
    searchParamsData as Record<string, string>,
  );

  const { cv: cacheVersion } = await fetch(
    `${API_GATE}/stories?${searchParams.toString()}`,
    {
      next: {
        tags: [SB_CACHE_VERSION],
        revalidate: isDraftMode ? 0 : false,
      },
    },
  ).then((res) => res.json());

  return cacheVersion;
};

// The main function to fetch a story by slug
// Next.js data cache enabled
export async function fetchStoryBySlug(
  isDraftMode: boolean,
  slug?: string[],
): Promise<{ story: ISbStoryData }> {
  const cv = await getSbCacheCvParameter(isDraftMode);
  const contentVersion = isDraftMode ? "draft" : "published";

  const searchParamsData: ISbStoriesParams = {
    token: process.env.SB_PREVIEW_TOKEN,
    cv,
    version: contentVersion,
  };

  const searchParams = new URLSearchParams(
    searchParamsData as Record<string, string>,
  );

  console.log(
    "request",
    `${API_GATE}/stories/${slug?.join("/") || ""}?${searchParams.toString()}`,
  );

  const { story } = await fetch(
    `${API_GATE}/stories/${slug?.join("/") || ""}?${searchParams.toString()}`,
    {
      next: {
        revalidate: isDraftMode ? 0 : false,
      },
    },
  ).then((res) => res.json());

  return {
    story,
  };
}

// This function uses only on a build lvl to generate a sitemap
export async function fetchAllPages() {
  const cv = await getSbCacheCvParameter(false);
  const storyblokApi = getStoryblokApi();

  const pagesData = await storyblokApi.get("cdn/links", {
    version: "published",
    cv,
    per_page: 1000,
  });

  const pages: { slug: string; is_folder: boolean }[] = Object.values(
    pagesData.data.links,
  );

  return pages;
}

// Fetch stories by params
// Next.js data cache enabled
export async function fetchStoriesByParams(
  isDraftModeEnabled: boolean,
  params?: ISbStoriesParams,
): Promise<{ data: ISbStoryData[]; headers: Headers }> {
  const contentVersion = isDraftModeEnabled ? "draft" : "published";
  const cv = await getSbCacheCvParameter(isDraftModeEnabled);

  const searchParamsData: ISbStoriesParams = {
    token: process.env.SB_PREVIEW_TOKEN,
    cv,
    version: contentVersion,
    ...params,
  };

  const searchParams = new URLSearchParams(
    searchParamsData as Record<string, string>,
  );

  try {
    const response = await fetch(
      `${API_GATE}/stories?${searchParams.toString()}`,
    );

    const data = await response.json();

    return { data: data.stories, headers: response.headers };
  } catch (error) {
    throw error;
  }
}
