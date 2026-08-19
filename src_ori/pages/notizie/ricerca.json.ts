import { getCollection } from 'astro:content';

export async function GET() {
  const notizie = await getCollection('notizie');
  const index = notizie
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
    .map(n => ({
      id: n.id,
      title: n.data.title,
      date: n.data.date,
      excerpt: n.data.excerpt,
    }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
}