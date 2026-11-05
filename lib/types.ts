export type LicenseType = 'Public Domain' | 'Creative Commons' | 'Author-owned' | 'Explicit permission';

export type BookStatus = 'pending' | 'approved' | 'rejected';

export interface Category {
  id: string;
  name: string;
  description: string;
  featured?: boolean;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  description: string;
  category: string;
  language: string;
  publicationYear: number;
  isbn?: string;
  publisher: string;
  coverUrl: string;
  fileFormat: 'PDF';
  licenseType: LicenseType;
  licenseEvidence: string;
  rightsConfirmed: boolean;
  status: BookStatus;
  uploaderId: string;
  featured: boolean;
  createdAt: string;
  tags: string[];
}
