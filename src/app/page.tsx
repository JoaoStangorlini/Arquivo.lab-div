import Link from 'next/link';
import nextDynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SidebarLeft } from '@/components/layout/SidebarLeft';
import { SidebarRight } from '@/components/layout/SidebarRight';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import {
  fetchSubmissions,
  fetchTrendingSubmissions,
  getFeaturedSubmissions,
  getTrendingTags,
} from '@/app/actions/submissions';
import { Rocket } from 'lucide-react';

// Direct import — contains LCP image, must SSR
import { HomeClientView } from '@/components/HomeClientView';

// Performance: Use ISR with 60s revalidation instead of force-dynamic
// This allows cached SSR responses, combined with unstable_cache wrappers on data fetches
export const revalidate = 60;

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, type?: string, collection?: string, q?: string }> }) {
  const params = await searchParams;
  const initialCategory = params.category || params.type || 'Todos';
  const initialCollection = params.collection || '';
  const initialQuery = params.q || '';

  // Parallel Data Fetching — only above-the-fold data
  const [
    { items: initialItems, hasMore: initialHasMore },
    trendingItems,
    featuredItems,
    trendingTags,
  ] = await Promise.all([
    fetchSubmissions({
      page: 1,
      limit: 6,
      query: initialQuery,
      categories: initialCategory === 'Todos' ? [] : [initialCategory],
      sort: 'recentes'
    }),
    fetchTrendingSubmissions(),
    getFeaturedSubmissions(3),
    getTrendingTags(),
  ]);

  // Performance: skip sequential checkUserLikes on server (adds 100-200ms TTFB)
  // Liked status will hydrate on client side instead of blocking SSR
  const initialLikedIds: string[] = [];

  return (
    <div className="bg-background-light dark:bg-transparent text-text-main dark:text-gray-100 min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-[1920px] mx-auto flex justify-center">
        {/* Esquerda: Navegação / Side Menu */}
        <aside className="hidden xl:block w-[280px] shrink-0 border-r border-gray-200 dark:border-gray-800 bg-background-light dark:bg-transparent">
          <div className="sticky top-20">
            <SidebarLeft />
          </div>
        </aside>

        {/* Centro: Feed */}
        <main id="main-content" tabIndex={-1} className="flex-1 max-w-[800px] w-full px-4 sm:px-6 py-8 lg:py-12 outline-none">
          <HomeClientView
            initialItems={initialItems}
            initialHasMore={initialHasMore}
            initialCategory={initialCategory}
            trendingItems={trendingItems}
            featuredItems={featuredItems}
            trendingTags={trendingTags}
            initialLikedIds={initialLikedIds}
          />
        </main>

        {/* Direita: hidden on mobile, fetches own data */}
        <aside className="hidden lg:block w-[320px] shrink-0 px-4 py-8 border-l border-gray-200 dark:border-gray-800 bg-background-light dark:bg-transparent">
          <div className="sticky top-20">
            <SidebarRight />
          </div>
        </aside>
      </div>

      <Footer />

      {/* FAB via Lucide */}
      <Link
        href="/enviar"
        className="hidden xl:flex fixed bottom-8 right-8 z-[60] bg-brand-blue text-white px-6 h-14 rounded-full shadow-2xl items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all group"
        title="Lançar à Órbita"
      >
        <Rocket className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
        <span className="font-bold text-sm tracking-wide">Lançar à Órbita</span>
      </Link>

      <BottomNavBar />
    </div>
  );
}
