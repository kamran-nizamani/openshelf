export type PublicBook = {
  id: string; title: string; author: string; description: string;
  category_id: string; category_name: string; category_slug: string;
  language: string; publication_year: number | null; isbn: string | null;
  publisher: string | null; page_count: number | null; cover_url: string | null;
  file_size: number | null; license_type: string; allow_download: boolean;
  created_at: string; uploader_name: string;
  avg_rating: number; review_count: number; download_count: number;
};

export type Category = { id: string; name: string; slug: string };
